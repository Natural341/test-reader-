
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { QuestionView } from './components/QuestionView';
import { SessionSummary } from './components/SessionSummary';
import { Loader } from './components/Loader';
import { analyzeImage, checkAnswerAndGetSubject } from './services/geminiService';
import type { Question, SessionData, AppState, AnswerFeedback, Theme, VoiceOption, AnalysisStep } from './types';
import { ThemeToggle } from './components/ThemeToggle';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('UPLOADING');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [originalQuestions, setOriginalQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [feedbacks, setFeedbacks] = useState<{ [key: number]: AnswerFeedback | null }>({});
  
  const [sessionData, setSessionData] = useState<SessionData>({
    totalQuestions: 0,
    correctCount: 0,
    incorrectCount: 0,
    incorrectQuestions: [],
    sessionDate: new Date().toISOString(),
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('idle');

  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [voice, setVoice] = useState<VoiceOption>('Zephyr');
  const [speechRate, setSpeechRate] = useState<number>(1);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);


  const handleFileAnalysis = useCallback(async (file: File) => {
    setIsLoading(true);
    setAppState('ANALYZING');
    setError(null);
    setAnalysisStep('uploading');

    try {
      // Short delay to show the first step
      await new Promise(resolve => setTimeout(resolve, 300));
      setAnalysisStep('analyzing');

      const parsedQuestions = await analyzeImage(file);
      
      setAnalysisStep('extracting');
      await new Promise(resolve => setTimeout(resolve, 300));

      if (parsedQuestions && parsedQuestions.length > 0) {
        setAnalysisStep('starting');
        await new Promise(resolve => setTimeout(resolve, 300));

        setQuestions(parsedQuestions);
        setOriginalQuestions(parsedQuestions);
        setSessionData(prev => ({
          ...prev,
          totalQuestions: parsedQuestions.length,
        }));
        setFeedbacks({});
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        setAppState('ANSWERING');
      } else {
        throw new Error("Görselden soru çıkarılamadı. Lütfen daha net bir görsel deneyin.");
      }
      setIsLoading(false);
      setAnalysisStep('idle');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.");
      setAppState('UPLOADING');
      setIsLoading(false);
      setAnalysisStep('idle');
    }
  }, []);

  const handleAnswerSubmit = async (userAnswer: string): Promise<void> => {
    const question = questions[currentQuestionIndex];
    if (!question || feedbacks[currentQuestionIndex]) return;

    const feedback = await checkAnswerAndGetSubject(question, userAnswer);

    setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: userAnswer }));
    setFeedbacks(prev => ({ ...prev, [currentQuestionIndex]: feedback }));

    setSessionData(prev => {
      const newIncorrectQuestions = [...prev.incorrectQuestions];
      if (!feedback.isCorrect) {
        const isAlreadyAdded = newIncorrectQuestions.some(q => q.questionText === question.questionText);
        if(!isAlreadyAdded) {
            newIncorrectQuestions.push({
              questionText: question.questionText,
              subject: feedback.subject || 'Belirlenemedi',
              userAnswer: userAnswer,
              correctAnswer: question.correctAnswerKey
            });
        }
      }

      return {
        ...prev,
        correctCount: feedback.isCorrect ? prev.correctCount + 1 : prev.correctCount,
        incorrectCount: !feedback.isCorrect ? prev.incorrectCount + 1 : prev.incorrectCount,
        incorrectQuestions: newIncorrectQuestions,
      };
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setAppState('SUMMARY');
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinishTest = () => {
      setAppState('SUMMARY');
  }

  const handleRestart = () => {
    setAppState('UPLOADING');
    setQuestions([]);
    setOriginalQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setFeedbacks({});
    setSessionData({
      totalQuestions: 0,
      correctCount: 0,
      incorrectCount: 0,
      incorrectQuestions: [],
      sessionDate: new Date().toISOString(),
    });
    setError(null);
    setIsLoading(false);
    setAnalysisStep('idle');
  };
  
  const handleReviewIncorrect = () => {
    if (sessionData.incorrectQuestions.length === 0) return;

    const incorrectQuestionTexts = sessionData.incorrectQuestions.map(q => q.questionText);
    const reviewQuestions = originalQuestions.filter(q => incorrectQuestionTexts.includes(q.questionText));

    if (reviewQuestions.length > 0) {
        setQuestions(reviewQuestions);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setFeedbacks({});
        setSessionData({
            totalQuestions: reviewQuestions.length,
            correctCount: 0,
            incorrectCount: 0,
            incorrectQuestions: [],
            sessionDate: new Date().toISOString(),
        });
        setAppState('ANSWERING');
    }
};

  const renderContent = () => {
    if (isLoading) {
      return <Loader 
                step={analysisStep}
              />;
    }
    
    switch (appState) {
      case 'UPLOADING':
        return <FileUpload 
                  onFileSelect={handleFileAnalysis} 
                  error={error} 
                  selectedVoice={voice}
                  onVoiceChange={setVoice}
                  speechRate={speechRate}
                  onSpeechRateChange={setSpeechRate}
                />;
      case 'ANSWERING':
        const currentQuestion = questions[currentQuestionIndex];
        return <QuestionView 
                  key={currentQuestionIndex}
                  question={currentQuestion} 
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={questions.length}
                  onAnswerSubmit={handleAnswerSubmit}
                  onNextQuestion={handleNextQuestion}
                  onPreviousQuestion={handlePreviousQuestion}
                  onFinishTest={handleFinishTest}
                  userAnswer={userAnswers[currentQuestionIndex] || null}
                  feedback={feedbacks[currentQuestionIndex] || null}
                  voice={voice}
                  speechRate={speechRate}
                />;
      case 'SUMMARY':
        return <SessionSummary sessionData={sessionData} onRestart={handleRestart} onReviewIncorrect={handleReviewIncorrect} />;
      case 'ANALYZING': // Fallback for when loading is false but state is analyzing
        return <Loader step={analysisStep} />;
      default:
        return <FileUpload 
                  onFileSelect={handleFileAnalysis} 
                  error={error} 
                  selectedVoice={voice}
                  onVoiceChange={setVoice}
                  speechRate={speechRate}
                  onSpeechRateChange={setSpeechRate}
                />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-4xl flex justify-end mb-4">
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </header>
      <main className="w-full max-w-4xl bg-white dark:bg-[#2D2D2D] rounded-md border-4 border-ink dark:border-ink-dark shadow-[8px_8px_0px_0px_rgba(58,58,58,1)] dark:shadow-[8px_8px_0px_0px_rgba(152,193,217,0.7)] p-6 sm:p-8 md:p-10 flex flex-col">
        {appState === 'UPLOADING' && (
          <div className="w-full text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-primary dark:text-primary-dark tracking-wider">
              YKS Asistanı
            </h1>
            <p className="text-md text-ink/70 dark:text-ink-dark/70 mt-2">
              AI Destekli Sınav Asistanı
            </p>
          </div>
        )}
        <div className="flex-grow">
          {renderContent()}
        </div>
      </main>
      <footer className="w-full max-w-4xl text-center text-ink/60 dark:text-ink-dark/60 mt-8 text-sm">
        <p>Gemini API ile güçlendirilmiştir.</p>
      </footer>
    </div>
  );
};

export default App;
