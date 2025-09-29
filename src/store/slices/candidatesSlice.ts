import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CandidateDetails, InterviewQuestion } from './interviewSlice';
import { v4 as uuidv4 } from 'uuid';
export interface Candidate {
  id: string;
  details: CandidateDetails;
  questions: InterviewQuestion[];
  totalScore: number | null;
  finalSummary: string | null;
  completedAt: string; // ISO string for timestamping
}
interface CandidatesState {
  list: Candidate[];
}

const initialState: CandidatesState = {
  list: [],
};

export const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<Omit<Candidate, 'id' | 'completedAt'>>) => {
      const newCandidate: Candidate = {
        id: uuidv4(),
        ...action.payload,
        completedAt: new Date().toISOString(),
      };
      state.list.push(newCandidate);
    },
  },
});

export const { addCandidate } = candidatesSlice.actions;

export default candidatesSlice.reducer;

