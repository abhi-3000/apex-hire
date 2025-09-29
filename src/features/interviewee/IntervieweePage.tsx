import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion'; // 1. Import the 'Variants' type
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import ResumeUpload from './components/ResumeUpload';
import ChatWindow from './components/ChatWindow';
import { getTextFromPdf } from '../../lib/pdfUtils';
import { validateAndGetCorrections } from '../../lib/validationUtils';
import {
  setCandidateDetails,
  setInterviewStatus,
  addMessage,
  startCorrectionFlow,
} from '../../store/slices/interviewSlice';
import { handleSuccessfulOnboarding } from '../../store/thunks/interviewThunks';

const IntervieweePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const interviewStatus = useAppSelector((state) => state.interview.status);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const resumeText = await getTextFromPdf(file);
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      });

      if (!response.ok) throw new Error('Failed to get a response from the AI.');
      const data = await response.json();
      
      dispatch(setCandidateDetails(data));
      const validationResult = validateAndGetCorrections(data);
      dispatch(setInterviewStatus('active'));

      if (validationResult.isValid) {
        dispatch(handleSuccessfulOnboarding(data));
      } else {
        const welcomeMessage = `Hello, ${data.name || 'there'}! I've reviewed your resume. A few details need confirmation.`;
        dispatch(addMessage({ sender: 'ai', text: welcomeMessage }));
        dispatch(startCorrectionFlow(validationResult.fieldsToCorrect));
      }

    } catch (err) {
      console.error(err);
      dispatch(setInterviewStatus('active'));
      await new Promise(resolve => setTimeout(resolve, 100));
      const errorMessage = "I'm sorry, I encountered an error reading that document. Let's get your details manually.";
      dispatch(addMessage({ sender: 'ai', text: errorMessage }));
      dispatch(startCorrectionFlow(['name', 'email', 'phone']));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. THE FIX: Explicitly type the variants object with the imported 'Variants' type.
  const pageVariants: Variants = {
    initial: {
      opacity: 0,
      scale: 0.95,
      filter: 'blur(10px)',
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      filter: 'blur(10px)',
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // 3. THE FIX: Do the same for the content variants.
  const contentVariants: Variants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      className="relative w-full max-w-7xl mx-auto flex flex-col justify-center items-center h-[calc(100vh-200px)] min-h-[500px]"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="absolute inset-0 overflow-hidden rounded-[40px]">
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-dark-secondary/5 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-dark-primary/5 via-transparent to-transparent rounded-full blur-3xl" />
        </motion.div>
        <motion.div className="absolute top-1/4 right-1/4 w-2 h-2 bg-gradient-to-r from-dark-primary to-dark-secondary rounded-full" animate={{ y: [0, -30, 0], x: [0, 15, 0], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-gradient-to-r from-dark-secondary to-dark-primary rounded-full" animate={{ y: [0, 20, 0], x: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
        <motion.div className="absolute top-1/2 left-1/4 w-2 h-2 bg-gradient-to-r from-dark-primary to-dark-secondary rounded-full" animate={{ y: [0, -25, 0], x: [0, 25, 0], opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }} />
      </div>

      <motion.div
        className="relative bg-white/60 backdrop-blur-2xl rounded-[40px] shadow-2xl w-full h-full p-6 sm:p-8 md:p-10 border border-white/30 overflow-hidden"
        style={{ boxShadow: '0 20px 60px -15px rgba(0, 73, 153, 0.15), 0 10px 40px -10px rgba(0, 122, 255, 0.1)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-dark-secondary/[0.02] via-transparent to-dark-primary/[0.02] rounded-[40px] pointer-events-none" />

        <AnimatePresence mode="wait">
          {interviewStatus === 'idle' ? (
            <motion.div key="resume-upload" className="relative h-full flex items-center justify-center" variants={contentVariants} initial="initial" animate="animate" exit="exit">
              <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
                <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full bg-gradient-to-r from-dark-primary/10 via-dark-secondary/10 to-dark-primary/10 blur-3xl animate-pulse-slow" />
              </motion.div>
              <ResumeUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
            </motion.div>
          ) : (
            <motion.div key="chat-window" className="relative h-full" variants={contentVariants} initial="initial" animate="animate" exit="exit">
              <ChatWindow />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-400/20 blur-xl rounded-2xl" />
                <div className="relative bg-gradient-to-r from-red-500/10 to-red-400/10 backdrop-blur-xl rounded-2xl px-6 py-3 border border-red-200/30">
                  <p className="text-red-600 font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-[40px] flex items-center justify-center z-50">
              <motion.div className="relative" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                <div className="w-16 h-16 border-4 border-light-secondary/20 rounded-full">
                  <div className="w-full h-full border-4 border-transparent border-t-dark-secondary border-r-dark-primary rounded-full animate-spin" />
                </div>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="absolute top-20 left-1/2 transform -translate-x-1/2 text-dark-primary font-medium whitespace-nowrap">
                  Processing your resume...
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default IntervieweePage;





