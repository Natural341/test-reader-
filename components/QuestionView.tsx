
import React, { useState, useEffect } from 'react';
import type { Question, AnswerFeedback, VoiceOption } from '../types';
import { TextToSpeechButton } from './TextToSpeechButton';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface QuestionViewProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSubmit: (userAnswer: string) => Promise<void>;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  onFinishTest: () => void;
  userAnswer: string | null;
  feedback: AnswerFeedback | null;
  voice: VoiceOption;
  speechRate: number;
}

export const QuestionView: React.FC<QuestionViewProps> = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  onAnswerSubmit, 
  onNextQuestion,
  onPreviousQuestion,
  onFinishTest,
  userAnswer,
  feedback,
  voice,
  speechRate
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(userAnswer);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [ariaLiveMessage, setAriaLiveMessage] = useState('');

  useEffect(() => {
    setSelectedOption(userAnswer);
    setAriaLiveMessage(`Soru ${questionNumber} yüklendi.`);
  }, [question, questionNumber, userAnswer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption || feedback) return;

    setIsSubmitting(true);
    await onAnswerSubmit(selectedOption);
    setIsSubmitting(false);
    setAriaLiveMessage(`Cevabınız kontrol edildi.`);
  };

  const fullTextToSpeak = [
      question.associatedParagraph ? `Bu soruya bağlı paragraf: ${question.associatedParagraph}` : null,
      `Soru ${questionNumber}: ${question.questionText}`,
      ...question.options.map(opt => `${opt.key} şıkkı: ${opt.text}`)
    ].filter(Boolean).join('. ');
  
  const getOptionClass = (key: string) => {
    const baseClass = "flex items-center p-4 rounded-md border-2 cursor-pointer transition-all duration-200";
    if (!feedback) {
        return `${baseClass} ${selectedOption === key 
            ? 'border-primary dark:border-primary-dark bg-accent dark:bg-accent-dark ring-2 ring-primary dark:ring-primary-dark' 
            : 'border-ink/30 dark:border-ink-dark/30 bg-white dark:bg-paper-dark/50 hover:bg-paper dark:hover:bg-accent-dark'}`;
    }
    if (key === question.correctAnswerKey) {
        return `${baseClass} border-correct bg-correct/20 ring-2 ring-correct`;
    }
    if (key === selectedOption) {
        return `${baseClass} border-incorrect bg-incorrect/20 ring-2 ring-incorrect`;
    }
    return `${baseClass} border-ink/20 dark:border-ink-dark/20 bg-paper dark:bg-paper-dark/30 text-ink/50 dark:text-ink-dark/50 cursor-not-allowed`;
  }
  
  const getButtonClasses = (color: 'primary' | 'secondary' | 'ghost', fullWidth: boolean = false, additionalClasses: string = '') => {
      const colorClasses = {
          primary: 'bg-primary border-primary text-white dark:bg-primary-dark dark:border-primary-dark dark:text-paper-dark',
          secondary: 'bg-secondary border-secondary text-white dark:bg-secondary-dark dark:border-secondary-dark dark:text-paper-dark',
          ghost: 'bg-transparent border-transparent text-ink dark:text-ink-dark hover:bg-accent dark:hover:bg-accent-dark'
      };
      return `${fullWidth ? 'w-full' : 'flex items-center justify-center'} ${additionalClasses} font-bold py-3 px-4 rounded-md border-2 ${colorClasses[color]} 
              shadow-[4px_4px_0px_0px_rgba(58,58,58,1)] dark:shadow-[4px_4px_0px_0px_rgba(152,193,217,0.7)] hover:shadow-none transform hover:-translate-x-1 hover:-translate-y-1 transition-all
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-paper dark:focus:ring-offset-paper-dark focus:ring-secondary dark:focus:ring-secondary-dark
              disabled:bg-ink/40 disabled:border-ink/40 disabled:text-paper disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed
              dark:disabled:bg-ink-dark/40 dark:disabled:border-ink-dark/40 dark:disabled:text-paper-dark`;
  }

  return (
    <div className="w-full">
      <div aria-live="assertive" className="sr-only">
        {ariaLiveMessage}
      </div>
      <div className="mb-4 flex justify-between items-center">
        <span className="text-ink/60 dark:text-ink-dark/60 font-medium" aria-label={`Soru ${questionNumber} / ${totalQuestions}`}>
          Soru: {questionNumber} / {totalQuestions}
        </span>
         <TextToSpeechButton
          textToSpeak={fullTextToSpeak}
          voice={voice}
          speechRate={speechRate}
        />
      </div>

      {question.associatedParagraph && (
        <div className="mb-6 p-4 bg-paper dark:bg-paper-dark/50 rounded-md border border-ink/20 dark:border-ink-dark/20 italic" tabIndex={0}>
          <p>{question.associatedParagraph}</p>
        </div>
      )}

      <h2 className="text-xl font-semibold text-ink dark:text-ink-dark flex-grow mb-6" tabIndex={0}>
        {question.questionText}
      </h2>

      <form onSubmit={handleSubmit}>
        <fieldset className="space-y-4" disabled={!!feedback}>
          <legend className="sr-only">Cevap Seçenekleri</legend>
          {question.options.map(option => (
            <label key={option.key} className={`${getOptionClass(option.key)}`}>
              <input
                type="radio"
                name="option"
                value={option.key}
                checked={selectedOption === option.key}
                onChange={() => setSelectedOption(option.key)}
                className="w-5 h-5 text-primary focus:ring-primary-focus form-radio flex-shrink-0"
                aria-label={`Seçenek ${option.key}`}
              />
              <span className="ml-4 text-lg text-ink dark:text-ink-dark">{option.key}) {option.text}</span>
            </label>
          ))}
        </fieldset>
        
        {!feedback && (
          <button 
            type="submit" 
            disabled={!selectedOption || isSubmitting}
            className={getButtonClasses('primary', true, 'mt-6')}
          >
            {isSubmitting ? 'Kontrol Ediliyor...' : 'Cevabı Kontrol Et'}
          </button>
        )}
      </form>

      {feedback && (
        <div className="mt-8">
            <div className={`p-4 rounded-md text-white dark:text-paper-dark font-bold text-center text-xl ${feedback.isCorrect ? 'bg-correct' : 'bg-incorrect'}`}>
                {feedback.feedbackText}
            </div>
            {!feedback.isCorrect && feedback.subject && (
                <div className="mt-4 p-4 bg-secondary/20 dark:bg-secondary-dark/20 border-l-4 border-secondary dark:border-secondary-dark text-secondary-focus dark:text-secondary-dark rounded-r-md">
                    <p><span className="font-bold">Konu:</span> {feedback.subject}</p>
                </div>
            )}
        </div>
      )}

      <div className="mt-8 flex justify-between items-center border-t-2 border-ink/20 dark:border-ink-dark/20 pt-4">
          <button 
              onClick={onPreviousQuestion}
              disabled={questionNumber === 1}
              className={getButtonClasses('ghost', false)}
              aria-label="Önceki Soru"
          >
              <ChevronLeftIcon className="w-6 h-6 mr-2" />
              Geri
          </button>
          <div className="flex items-center gap-4">
             <button onClick={onFinishTest} className={getButtonClasses('ghost', false, 'text-sm !py-2 !px-3 underline')}>
                Testi Bitir
            </button>
            <button 
                onClick={onNextQuestion}
                className={getButtonClasses('secondary', false)}
                autoFocus={!!feedback}
                aria-label={questionNumber === totalQuestions ? 'Sonuçları Gör' : 'Sonraki Soru'}
            >
                {questionNumber === totalQuestions ? 'Sonuçları Gör' : 'İleri'}
                <ChevronRightIcon className="w-6 h-6 ml-2" />
            </button>
          </div>
      </div>

    </div>
  );
};
