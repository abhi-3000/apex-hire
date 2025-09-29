import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  startInterview,
  saveAnswerAndScore,
  askNextQuestion,
  endInterview,
  addMessage,
  startTimer,
  setFinalSummary,
} from '../slices/interviewSlice';
import { addCandidate } from '../slices/candidatesSlice';
import type { InterviewQuestion, CandidateDetails } from '../slices/interviewSlice';
import type { RootState } from '../store';
import { playStartSound, playCompletionSound, playSuccessSound } from '../../lib/audioUtils';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const handleSuccessfulOnboarding = createAsyncThunk(
  'interview/handleSuccessfulOnboarding',
  async (details: CandidateDetails, { dispatch }) => {
    playSuccessSound();
    const welcomeMessage = `Hello, ${details.name}! Welcome to ApexHire.`;
    dispatch(addMessage({ sender: 'ai', text: welcomeMessage }));
    await sleep(1200);

    const verificationMessage = `I've successfully verified your details. Before we begin, please review the interview format.`;
    dispatch(addMessage({ sender: 'ai', text: verificationMessage }));
    await sleep(1500);

    const rulesMessage = "Here's how the interview will work:\n\n- **Total Questions**: 6\n- **Structure**: 2 Easy, 2 Medium, 2 Hard\n- **Scoring**: Each question is scored out of 10.\n- **Timing**:\n  - Easy: 20 seconds\n  - Medium: 60 seconds\n  - Hard: 120 seconds\n\nWhen the timer runs out, your answer will be submitted automatically. Let's begin with the first question.";
    dispatch(addMessage({ sender: 'ai', text: rulesMessage }));
    await sleep(2500);
    
    dispatch(fetchAndStartInterview('easy'));
  }
);

export const fetchAndStartInterview = createAsyncThunk(
  'interview/fetchAndStartInterview',
  async (difficulty: 'easy' | 'medium' | 'hard', { dispatch }) => {
    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty }),
      });
      if (!response.ok) throw new Error('Failed to fetch question');
      const data = await response.json();
      const newQuestion: InterviewQuestion = { text: data.question, difficulty, answer: null, score: null };
      dispatch(startInterview(newQuestion));
      dispatch(startTimer(20));
      playStartSound();
      return newQuestion;
    } catch (error) {
      console.error('Failed to fetch and start interview:', error);
      throw error;
    }
  }
);

export const submitAnswerAndGetNextQuestion = createAsyncThunk(
  'interview/submitAnswerAndGetNextQuestion',
  async (answer: string, { dispatch, getState }) => {
    const state = getState() as RootState;
    const { questions, currentQuestionIndex } = state.interview;
    const currentQuestion = questions[currentQuestionIndex];
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'easy', 'medium', 'medium', 'hard', 'hard'];
    
    const evaluatePromise = fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion.text, answer }),
    });

    const nextIndex = currentQuestionIndex + 1;
    let nextQuestionPromise: Promise<Response | null> = Promise.resolve(null);
    if (nextIndex < 6) {
      const nextDifficulty = difficulties[nextIndex];
      nextQuestionPromise = fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: nextDifficulty }),
      });
    }

    const [evalResponse, nextQuestionResponse] = await Promise.all([evaluatePromise, nextQuestionPromise]);

    if (!evalResponse.ok) throw new Error('Failed to evaluate answer');
    const evaluation = await evalResponse.json();
    dispatch(saveAnswerAndScore({ answer, ...evaluation }));
    dispatch(addMessage({ sender: 'ai', text: "Your answer has been recorded. Preparing the next question..." }));

    if (nextQuestionResponse) {
      if (!nextQuestionResponse.ok) throw new Error('Failed to fetch next question');
      const nextQuestionData = await nextQuestionResponse.json();
      const nextDifficulty = difficulties[nextIndex];
      const newQuestion: InterviewQuestion = {
        text: nextQuestionData.question,
        difficulty: nextDifficulty,
        answer: null,
        score: null,
      };
      await sleep(1500);
      dispatch(askNextQuestion(newQuestion));
      const timeLimit = nextDifficulty === 'easy' ? 20 : nextDifficulty === 'medium' ? 60 : 120;
      dispatch(startTimer(timeLimit));
    } else {
      dispatch(endInterview());
      playCompletionSound();
      dispatch(generateFinalSummary());
    }
  }
);

export const generateFinalSummary = createAsyncThunk(
  'interview/generateFinalSummary',
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    const { questions, candidateDetails, totalScore } = state.interview;
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: questions }),
      });
      if (!response.ok) throw new Error('Failed to fetch summary');
      const data = await response.json();
      dispatch(setFinalSummary(data.summary));
      const completedInterviewData = { details: candidateDetails, questions, totalScore, finalSummary: data.summary };
      dispatch(addCandidate(completedInterviewData));
      await sleep(1500);
      const finalMessage = "Your results have been successfully submitted to the hiring team. Thank you for your time! You may now close this window.";
      dispatch(addMessage({ sender: 'ai', text: finalMessage }));
    } catch (error) {
      console.error('Failed to generate final summary:', error);
      const failedInterviewData = { details: candidateDetails, questions, totalScore, finalSummary: "Error: Could not generate summary." };
      dispatch(addCandidate(failedInterviewData));
      await sleep(1500);
      const finalMessage = "Your results have been successfully submitted. Thank you for your time! You may now close this window.";
      dispatch(addMessage({ sender: 'ai', text: finalMessage }));
    }
  }
);

