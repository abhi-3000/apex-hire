import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxHooks';
import MessageBubble from './MessageBubble';
import Timer from './Timer';
import { addMessage, processNextCorrection, setCandidateDetails, setInterviewStatus, stopTimer, tickTimer } from '../../../store/slices/interviewSlice';
import { fetchAndStartInterview, submitAnswerAndGetNextQuestion } from '../../../store/thunks/interviewThunks';
import { Send, Loader2 } from 'lucide-react';
import type { CorrectionField } from '../../../lib/validationUtils';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ChatWindow: React.FC = () => {
  const dispatch = useAppDispatch();
  const [inputValue, setInputValue] = useState('');
  const { messages, correctionQueue, status, timerActive, remainingTime, questions, currentQuestionIndex } = useAppSelector((state) => state.interview);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentCorrection = correctionQueue.length > 0 ? correctionQueue[0] : null;
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (timerActive) {
      const interval = setInterval(() => { dispatch(tickTimer()); }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive, dispatch]);

  useEffect(() => {
    if (timerActive && remainingTime === 0) {
      handleSendMessage(true);
    }
  }, [remainingTime, timerActive]);

  useEffect(() => {
    if (currentCorrection) {
      const timer = setTimeout(() => { askForCorrection(currentCorrection); }, 800);
      return () => clearTimeout(timer);
    }
  }, [correctionQueue.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const askForCorrection = (field: CorrectionField) => {
    let question = '';
    switch (field) {
      case 'name': question = "Could you please provide your full name?"; break;
      case 'email': question = "Could you please provide your email address?"; break;
      case 'phone': question = "And finally, your 10-digit phone number?"; break;
    }
    if (messages[messages.length - 1]?.text !== question) {
      dispatch(addMessage({ sender: 'ai', text: question }));
    }
  };

  const handleSendMessage = async (isAutoSubmit = false) => {
    if (timerActive) dispatch(stopTimer());
    if ((inputValue.trim() === '' && !isAutoSubmit) || status === 'loading') return;
    
    const userAnswer = isAutoSubmit ? (inputValue.trim() || "[Time's Up! No answer provided.]") : inputValue;
    dispatch(addMessage({ sender: 'user', text: userAnswer }));
    setInputValue('');

    if (currentCorrection) {
      let isValid = false;
      switch (currentCorrection) {
        case 'name':
          isValid = userAnswer.length > 2;
          if (isValid) dispatch(setCandidateDetails({ name: userAnswer }));
          break;
        case 'email':
          isValid = emailRegex.test(userAnswer);
          if (isValid) dispatch(setCandidateDetails({ email: userAnswer }));
          break;
        case 'phone':
          const sanitizedPhone = userAnswer.replace(/[\s-()+]/g, '');
          isValid = phoneRegex.test(sanitizedPhone.slice(-10));
          if (isValid) dispatch(setCandidateDetails({ phone: sanitizedPhone.slice(-10) }));
          break;
      }
      
      if (isValid) {
        dispatch(addMessage({ sender: 'ai', text: "Thank you, I've updated that." }));
        dispatch(processNextCorrection());
        if (correctionQueue.length === 1) {
            await sleep(1200);
            dispatch(addMessage({ sender: 'ai', text: "Great, all your details are confirmed. Let's begin the interview." }));
            await sleep(1500);
            dispatch(fetchAndStartInterview('easy'));
        }
      } else {
        dispatch(addMessage({ sender: 'ai', text: "That doesn't seem right. Please try again." }));
      }
    } else if (status === 'active') {
      try {
        dispatch(setInterviewStatus('loading'));
        await dispatch(submitAnswerAndGetNextQuestion(userAnswer)).unwrap();
      } catch (error) {
        console.error("An error occurred during the interview loop:", error);
        dispatch(addMessage({ sender: 'ai', text: "An error occurred. Let's try that again." }));
      } finally {
        dispatch(setInterviewStatus('active'));
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(false);
    }
  };

  const isInputDisabled = status !== 'active';

  return (
    <motion.div 
      className="w-full h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Timer Section with updated styling */}
      <div className="flex-shrink-0 flex justify-center p-4 border-b border-white/20 min-h-[120px]">
        <AnimatePresence>
          {timerActive && currentQuestion && remainingTime !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <Timer
                key={currentQuestionIndex}
                remainingTime={remainingTime}
                totalTime={
                  currentQuestion.difficulty === 'easy' ? 20 :
                  currentQuestion.difficulty === 'medium' ? 60 : 120
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat History with custom scrollbar */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto flex flex-col custom-scrollbar">
        {messages.map((msg, index) => (
          <MessageBubble key={index} sender={msg.sender} message={msg.text} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Upgraded Input Area */}
      <motion.div 
        className="flex-shrink-0 mt-4 p-4 border-t border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative">
          <Input
            type="text"
            placeholder={isInputDisabled ? "ApexHire is thinking..." : "Your answer..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isInputDisabled}
            className="w-full pl-5 pr-16 py-7 text-base bg-white/80 backdrop-blur-xl border-white/50 rounded-2xl shadow-lg placeholder:text-light-secondary/70 focus:ring-2 focus:ring-dark-secondary/30 focus:border-dark-secondary/30 transition-all duration-300 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)' }}
          />
          <motion.button
            onClick={() => handleSendMessage(false)}
            disabled={isInputDisabled}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-dark-primary to-dark-secondary text-light-primary font-inter font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isInputDisabled ? 1 : 1.05 }}
            whileTap={{ scale: isInputDisabled ? 1 : 0.95 }}
          >
            {status === 'loading' ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChatWindow;




