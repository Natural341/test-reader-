
import React from 'react';
import type { SessionData } from '../types';
import { CheckCircleIcon, XCircleIcon, RestartIcon } from './Icons';

interface SessionSummaryProps {
  sessionData: SessionData;
  onRestart: () => void;
  onReviewIncorrect: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({ sessionData, onRestart, onReviewIncorrect }) => {
  const { totalQuestions, correctCount, incorrectCount, incorrectQuestions } = sessionData;
  const accuracy = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(1) : 0;
  
  const getButtonStyle = (type: 'primary' | 'secondary') => {
      const base = "w-full flex items-center justify-center font-bold py-3 px-4 rounded-md border-2 shadow-[4px_4px_0px_0px_rgba(58,58,58,1)] dark:shadow-[4px_4px_0px_0px_rgba(152,193,217,0.7)] hover:shadow-none transform hover:-translate-x-1 hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-paper dark:focus:ring-offset-paper-dark focus:ring-secondary dark:focus:ring-secondary-dark";
      if(type === 'primary') {
          return `${base} bg-primary text-white dark:bg-primary-dark dark:text-paper-dark border-primary dark:border-primary-dark`;
      }
      return `${base} bg-secondary text-white dark:bg-secondary-dark dark:text-paper-dark border-secondary dark:border-secondary-dark`;
  }

  return (
    <div className="w-full animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-primary dark:text-primary-dark mb-4">Oturum Özeti</h2>
      <p className="text-center text-ink/70 dark:text-ink-dark/70 mb-8">Performansınızın bir dökümü.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-center">
        <div className="bg-paper dark:bg-paper-dark/50 p-6 rounded-md border-2 border-ink dark:border-ink-dark">
          <CheckCircleIcon className="w-12 h-12 text-correct mx-auto mb-3" />
          <p className="text-4xl font-extrabold text-correct">{correctCount}</p>
          <p className="text-lg font-medium text-ink/70 dark:text-ink-dark/70">Doğru</p>
        </div>
        <div className="bg-paper dark:bg-paper-dark/50 p-6 rounded-md border-2 border-ink dark:border-ink-dark">
          <XCircleIcon className="w-12 h-12 text-incorrect mx-auto mb-3" />
          <p className="text-4xl font-extrabold text-incorrect">{incorrectCount}</p>
          <p className="text-lg font-medium text-ink/70 dark:text-ink-dark/70">Yanlış</p>
        </div>
        <div className="bg-paper dark:bg-paper-dark/50 p-6 rounded-md border-2 border-ink dark:border-ink-dark">
          <div className="w-12 h-12 text-primary dark:text-primary-dark mx-auto mb-3 flex items-center justify-center text-2xl font-bold">%</div>
          <p className="text-4xl font-extrabold text-primary dark:text-primary-dark">{accuracy}</p>
          <p className="text-lg font-medium text-ink/70 dark:text-ink-dark/70">Başarı</p>
        </div>
      </div>

      {incorrectQuestions.length > 0 && (
        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-4 text-ink dark:text-ink-dark">Gözden Geçirilecek Konular</h3>
          <ul className="space-y-3">
            {incorrectQuestions.map((q, index) => (
              <li key={index} className="p-4 bg-paper dark:bg-paper-dark/50 rounded-md border border-ink/20 dark:border-ink-dark/20">
                <p className="font-semibold text-ink dark:text-ink-dark truncate">{q.questionText}</p>
                <p className="text-sm text-incorrect mt-1"><span className="font-bold">Konu:</span> {q.subject}</p>
                 <p className="text-sm text-ink/70 dark:text-ink-dark/70 mt-1">
                    <span className="font-semibold">Cevabın:</span> {q.userAnswer}, 
                    <span className="font-semibold ml-2">Doğru Cevap:</span> {q.correctAnswer}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 pt-6 border-t-2 border-ink/10 dark:border-ink-dark/10 flex flex-col sm:flex-row gap-4">
        {incorrectQuestions.length > 0 && (
             <button
                onClick={onReviewIncorrect}
                className={getButtonStyle('secondary')}
              >
                <RestartIcon className="w-5 h-5 mr-2"/>
                Yanlışları Tekrar Çöz
            </button>
        )}
        <button
          onClick={onRestart}
          className={getButtonStyle('primary')}
        >
          <RestartIcon className="w-5 h-5 mr-2"/>
          Yeni Oturum Başlat
        </button>
      </div>

    </div>
  );
};
