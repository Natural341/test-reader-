import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SpeakerIcon, SpeakerOffIcon } from './Icons';
import { generateSpeech } from '../services/geminiService';
import type { VoiceOption } from '../types';

interface TextToSpeechButtonProps {
  textToSpeak: string;
  voice: VoiceOption;
  speechRate: number;
}

const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({ textToSpeak, voice, speechRate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const sourceNodesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isCancelledRef = useRef<boolean>(false);

  const stopPlayback = useCallback(() => {
    isCancelledRef.current = true;
    sourceNodesRef.current.forEach(source => {
      source.stop();
      source.disconnect();
    });
    sourceNodesRef.current.clear();
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const handleClick = async () => {
    if (isLoading) return;
    
    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsLoading(true);
    isCancelledRef.current = false;

    // Split text into sentences for streaming playback
    const sentences = textToSpeak.match(/[^.!?]+[.!?]*/g) || [textToSpeak];
    let nextStartTime = audioContext.currentTime;
    let isFirstChunk = true;
    let playingCount = 0;

    for (const sentence of sentences) {
      if (isCancelledRef.current) break;
      if (!sentence.trim()) continue;
      
      try {
        const base64Audio = await generateSpeech(sentence, voice);
        if (isCancelledRef.current) break;

        const audioBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
        if (isCancelledRef.current) break;

        if (isFirstChunk) {
            setIsLoading(false);
            setIsPlaying(true);
            isFirstChunk = false;
        }

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = speechRate;
        source.connect(audioContext.destination);
        
        source.start(nextStartTime);
        playingCount++;
        
        source.onended = () => {
          sourceNodesRef.current.delete(source);
          playingCount--;
          if (playingCount === 0 && !isCancelledRef.current) {
              setIsPlaying(false);
          }
        };

        sourceNodesRef.current.add(source);
        nextStartTime += audioBuffer.duration / speechRate;

      } catch (error) {
        console.error("Ses oynatma hatası:", error);
        if(!isCancelledRef.current) {
            alert(`"${sentence.substring(0,20)}..." seslendirilirken bir hata oluştu.`);
        }
        stopPlayback();
        break;
      }
    }
    
    if (isFirstChunk && !isCancelledRef.current){
        // This case handles if all sentences failed or were empty
        setIsLoading(false);
        setIsPlaying(false);
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  const getIcon = () => {
    if (isLoading) {
      return (
        <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )
    }
    return isPlaying ? <SpeakerOffIcon className="w-6 h-6" /> : <SpeakerIcon className="w-6 h-6" />;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="p-2 flex-shrink-0 rounded-full text-ink/60 dark:text-ink-dark/60 hover:bg-accent dark:hover:bg-accent-dark hover:text-primary dark:hover:text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      aria-label={isPlaying ? "Okumayı durdur" : "Tüm soruyu sesli oku"}
      title={isPlaying ? "Okumayı durdur" : "Tüm soruyu sesli oku"}
      disabled={!textToSpeak || isLoading}
    >
      {getIcon()}
    </button>
  );
};