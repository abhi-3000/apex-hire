import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Layout from './features/shared/Layout';
import IntervieweePage from './features/interviewee/IntervieweePage';
import InterviewerPage from './features/interviewer/InterviewerPage';
import WelcomeBackModal from './features/shared/WelcomeBackModal';
import { useAppDispatch, useAppSelector } from './hooks/reduxHooks';
import { resetInterview } from './store/slices/interviewSlice';
import { persistor } from './store/store'; 

const AppLogic: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { status, currentQuestionIndex, finalSummary } = useAppSelector((state) => state.interview);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isStateChecked, setIsStateChecked] = useState(false);

  useEffect(() => {
    const checkPersistedState = async () => {
      await persistor.persist();
      if (status === 'finished' || finalSummary) {
        dispatch(resetInterview());
      }
      else if (status === 'active' && currentQuestionIndex >= 0) {
        setIsModalOpen(true);
      }
      setIsStateChecked(true);
    };

    checkPersistedState();
  }, [dispatch]);

  const handleResume = () => {
    setIsModalOpen(false);
    if (location.pathname !== '/') navigate('/');
  };

  const handleStartOver = () => {
    dispatch(resetInterview());
    setIsModalOpen(false);
    if (location.pathname !== '/') navigate('/');
  };

  
  if (!isStateChecked) {
    return null; 
  }

  return (
    <>
      <WelcomeBackModal
        isOpen={isModalOpen}
        onResume={handleResume}
        onStartOver={handleStartOver}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IntervieweePage />} />
          <Route path="dashboard" element={<InterviewerPage />} />
        </Route>
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppLogic />
    </BrowserRouter>
  );
}

export default App;

