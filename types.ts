
export interface QuestionOption {
  key: string;
  text: string;
}

export interface Question {
  id: number;
  questionText: string;
  options: QuestionOption[];
  correctAnswerKey: string;
  associatedParagraph?: string;
}

export interface IncorrectQuestionInfo {
  questionText: string;
  subject: string;
  userAnswer: string;
  correctAnswer: string;
}

export interface SessionData {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  incorrectQuestions: IncorrectQuestionInfo[];
  sessionDate: string;
}

export type AppState = 'UPLOADING' | 'ANALYZING' | 'ANSWERING' | 'SUMMARY';

export interface AnswerFeedback {
  isCorrect: boolean;
  feedbackText: string;
  subject?: string;
}

export type Theme = 'light' | 'dark';

export type VoiceOption = 'Zephyr' | 'Charon'; // Zephyr (Kadın), Charon (Erkek) - Yetişkin sesleri

export type AnalysisStep = 'idle' | 'uploading' | 'analyzing' | 'extracting' | 'starting';
