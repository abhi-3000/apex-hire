import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CorrectionField } from '../../lib/validationUtils';

export interface InterviewQuestion {
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answer: string | null;
  score: number | null;
  justification?: string | null;
}

export interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
}

export interface CandidateDetails {
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface InterviewState {
  status: 'idle' | 'loading' | 'active' | 'finished';
  candidateDetails: CandidateDetails;
  messages: ChatMessage[];
  correctionQueue: CorrectionField[];
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  timerActive: boolean;
  remainingTime: number | null;
  finalSummary: string | null;
  totalScore: number | null;
}

const initialState: InterviewState = {
  status: 'idle',
  candidateDetails: { name: null, email: null, phone: null },
  messages: [],
  correctionQueue: [],
  questions: [],
  currentQuestionIndex: -1,
  timerActive: false,
  remainingTime: null,
  finalSummary: null,
  totalScore: null,
};

export const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setCandidateDetails: (state, action: PayloadAction<Partial<CandidateDetails>>) => {
      state.candidateDetails = { ...state.candidateDetails, ...action.payload };
    },
    setInterviewStatus: (state, action: PayloadAction<InterviewState['status']>) => {
      state.status = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    startCorrectionFlow: (state, action: PayloadAction<CorrectionField[]>) => {
      state.correctionQueue = action.payload;
    },
    processNextCorrection: (state) => {
      state.correctionQueue.shift();
    },
    startInterview: (state, action: PayloadAction<InterviewQuestion>) => {
      state.questions.push(action.payload);
      state.currentQuestionIndex = 0;
      state.messages.push({ sender: 'ai', text: action.payload.text });
    },
    saveAnswerAndScore: (state, action: PayloadAction<{ answer: string; score: number; justification: string }>) => {
      if (state.currentQuestionIndex >= 0) {
        state.questions[state.currentQuestionIndex].answer = action.payload.answer;
        state.questions[state.currentQuestionIndex].score = action.payload.score;
        state.questions[state.currentQuestionIndex].justification = action.payload.justification;
      }
    },
    askNextQuestion: (state, action: PayloadAction<InterviewQuestion>) => {
      state.questions.push(action.payload);
      state.currentQuestionIndex++;
      state.messages.push({ sender: 'ai', text: action.payload.text });
    },
    endInterview: (state) => {
      state.status= 'finished';
      state.timerActive = false;
      const totalScore = state.questions.reduce((acc, q) => acc + (q.score || 0), 0);
      state.totalScore = totalScore;
      const completionMessage = `The interview is now complete. Thank you for your time!\n\nYour final score is: ${totalScore} / 60.`;
      state.messages.push({ sender: 'ai', text: completionMessage });
    },
    startTimer: (state, action: PayloadAction<number>) => {
      state.timerActive = true;
      state.remainingTime = action.payload;
    },
    tickTimer: (state) => {
      if (state.timerActive && state.remainingTime !== null && state.remainingTime > 0) {
        state.remainingTime -= 1;
      }
    },
    stopTimer: (state) => {
      state.timerActive = false;
      state.remainingTime = null;
    },
    setFinalSummary: (state, action: PayloadAction<string>) => {
      state.finalSummary = action.payload;
    },
    resetInterview: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setCandidateDetails,
  setInterviewStatus,
  addMessage,
  startCorrectionFlow,
  processNextCorrection,
  startInterview,
  saveAnswerAndScore,
  askNextQuestion,
  endInterview,
  startTimer,
  tickTimer,
  stopTimer,
  setFinalSummary,
  resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;

