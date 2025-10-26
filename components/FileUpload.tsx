
import React, { useState, useCallback } from 'react';
import { UploadIcon, AlertIcon, WomanVoiceIcon, ManVoiceIcon } from './Icons';
import type { VoiceOption } from '../types';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  error: string | null;
  selectedVoice: VoiceOption;
  onVoiceChange: (voice: VoiceOption) => void;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
    onFileSelect, 
    error, 
    selectedVoice, 
    onVoiceChange,
    speechRate,
    onSpeechRateChange
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    handleDragEvents(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);
  
  const getVoiceButtonClass = (voice: VoiceOption) => {
      const base = "flex-1 flex flex-col items-center justify-center p-4 border-2 rounded-md cursor-pointer transition-all duration-200";
      if (selectedVoice === voice) {
          return `${base} bg-accent dark:bg-primary-dark/30 border-primary dark:border-primary-dark ring-2 ring-primary dark:ring-primary-dark`;
      }
      return `${base} bg-paper dark:bg-paper-dark/50 border-ink/30 dark:border-ink-dark/30 hover:border-primary dark:hover:border-primary-dark`;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      
       <div className="w-full mb-8">
        <h3 className="text-lg font-semibold text-ink dark:text-ink-dark mb-3 text-center">Ses Ayarları</h3>
        <div className="p-4 border-2 border-ink/20 dark:border-ink-dark/20 rounded-md space-y-4">
            <div className="flex gap-4">
                <button onClick={() => onVoiceChange('Zephyr')} className={getVoiceButtonClass('Zephyr')}>
                    <WomanVoiceIcon className="w-8 h-8 mb-2 text-primary dark:text-primary-dark"/>
                    <span className="font-medium">Kadın Sesi</span>
                </button>
                <button onClick={() => onVoiceChange('Charon')} className={getVoiceButtonClass('Charon')}>
                    <ManVoiceIcon className="w-8 h-8 mb-2 text-primary dark:text-primary-dark"/>
                    <span className="font-medium">Erkek Sesi</span>
                </button>
            </div>
            <div>
              <label htmlFor="speech-rate" className="block mb-2 text-sm font-medium text-ink/80 dark:text-ink-dark/80">Konuşma Hızı: {speechRate.toFixed(1)}x</label>
              <input
                id="speech-rate"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => onSpeechRateChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-paper dark:bg-paper-dark/50 rounded-lg appearance-none cursor-pointer accent-primary dark:accent-primary-dark"
              />
            </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-ink dark:text-ink-dark mb-2 text-center">Kitapçığı Yükle</h2>
      <p className="text-ink/70 dark:text-ink-dark/70 mb-6 text-center">Analiz için bir sayfa fotoğrafı veya PDF seçin.</p>
      
      <label
        htmlFor="dropzone-file"
        className={`flex flex-col items-center justify-center w-full h-64 border-2 rounded-md cursor-pointer transition-colors duration-200 ${isDragging ? 'border-primary bg-accent dark:border-primary-dark dark:bg-primary-dark/30' : 'border-ink/30 dark:border-ink-dark/30 bg-paper dark:bg-paper-dark/50 hover:border-primary dark:hover:border-primary-dark'}`}
        onDragEnter={(e) => handleDragEvents(e, true)}
        onDragOver={(e) => handleDragEvents(e, true)}
        onDragLeave={(e) => handleDragEvents(e, false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadIcon className="w-10 h-10 mb-4 text-ink/50 dark:text-ink-dark/50" />
          <p className="mb-2 text-sm text-ink/70 dark:text-ink-dark/70"><span className="font-semibold text-primary dark:text-primary-dark">Yüklemek için tıkla</span> veya sürükle</p>
          <p className="text-xs text-ink/50 dark:text-ink-dark/50">PNG, JPG, veya PDF</p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, application/pdf" />
      </label>

      {error && (
        <div className="mt-6 w-full p-4 bg-incorrect/10 border border-incorrect/50 text-incorrect rounded-md flex items-center" role="alert">
          <AlertIcon className="w-5 h-5 mr-3"/>
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};
