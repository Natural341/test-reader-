
import React from 'react';
import type { AnalysisStep } from '../types';
import { UploadIcon, ProcessingIcon, ListIcon, CheckIcon, RocketIcon } from './Icons';

interface LoaderProps {
  step: AnalysisStep;
}

const stepsConfig: { key: AnalysisStep, text: string, icon: React.FC<any> }[] = [
    { key: 'uploading', text: 'Görsel Yükleniyor ve Hazırlanıyor', icon: UploadIcon },
    { key: 'analyzing', text: 'Yapay Zeka Görüntüyü Analiz Ediyor', icon: ProcessingIcon },
    { key: 'extracting', text: 'Sorular ve Şıklar Çıkarılıyor', icon: ListIcon },
    { key: 'starting', text: 'Test Oturumu Başlatılıyor', icon: RocketIcon },
];

export const Loader: React.FC<LoaderProps> = ({ step }) => {
  const currentStepIndex = stepsConfig.findIndex(s => s.key === step);

  const getStepStatus = (index: number): 'completed' | 'in-progress' | 'pending' => {
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'in-progress';
    return 'pending';
  };

  const StatusIcon = ({ status }: { status: 'completed' | 'in-progress' | 'pending' }) => {
    if (status === 'completed') {
      return <CheckIcon className="w-6 h-6 text-correct" />;
    }
    if (status === 'in-progress') {
      return (
        <svg className="animate-spin h-6 w-6 text-primary dark:text-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    }
    // Pending
    const Icon = stepsConfig[currentStepIndex + 1]?.icon || (() => null);
    return <div className="w-6 h-6 border-2 border-ink/30 dark:border-ink-dark/30 rounded-full"></div>
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-10" role="status" aria-live="polite">
      <h2 className="text-2xl font-bold text-ink dark:text-ink-dark mb-8">Testiniz Hazırlanıyor...</h2>
      
      <div className="w-full max-w-md space-y-4">
        {stepsConfig.map((s, index) => {
          const status = getStepStatus(index);
          const Icon = s.icon;
          return (
            <div key={s.key} className={`flex items-center p-3 rounded-md transition-all duration-300 ${
              status === 'in-progress' ? 'bg-accent dark:bg-accent-dark' : ''
            } ${
              status === 'pending' ? 'opacity-50' : ''
            }`}>
              <div className="w-8 flex-shrink-0">
                {status === 'completed' 
                    ? <CheckIcon className="w-6 h-6 text-correct" />
                    : status === 'in-progress'
                    ? <svg className="animate-spin h-6 w-6 text-primary dark:text-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    : <div className="w-6 h-6 border-2 border-ink/30 dark:border-ink-dark/30 rounded-full" />
                }
              </div>
              <p className={`ml-4 font-medium ${
                status === 'in-progress' ? 'text-primary dark:text-primary-dark' : 'text-ink dark:text-ink-dark'
              }`}>
                {s.text}
              </p>
            </div>
          )
        })}
      </div>

      <p className="mt-10 text-sm text-ink/60 dark:text-ink-dark/60 max-w-md">
        Bu işlem, görselin karmaşıklığına ve yapay zeka yoğunluğuna bağlı olarak biraz zaman alabilir. Sabrınız için teşekkürler.
      </p>
    </div>
  );
};
