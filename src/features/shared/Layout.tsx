import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface TabButtonProps {
  to: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => {
  return (
    <motion.button
      className={`relative px-8 py-3 rounded-2xl text-base font-inter font-semibold transition-all duration-300 ${
        isActive 
          ? 'text-light-primary shadow-2xl shadow-dark-secondary/30' 
          : 'text-light-secondary hover:text-dark-primary bg-white/5 hover:bg-white/10 backdrop-blur-sm'
      } outline-none`}
      onClick={onClick}
      whileHover={{ scale: isActive ? 1 : 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isActive && (
        <motion.span
          layoutId="bubble"
          className="absolute inset-0 z-0 bg-gradient-to-r from-dark-primary via-dark-secondary to-dark-primary bg-[length:200%_100%] rounded-2xl animate-gradient"
          transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
          style={{
            boxShadow: '0 4px 15px rgba(0, 122, 255, 0.4)',
          }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {label}
        {isActive && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-2 h-2 bg-light-primary rounded-full animate-pulse"
          />
        )}
      </span>
    </motion.button>
  );
};

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isIntervieweeActive = location.pathname === '/';
  const isInterviewerActive = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen font-inter text-black flex flex-col items-center relative overflow-hidden">
      
      <div className="fixed inset-0 bg-gradient-to-br from-light-primary via-blue-50/50 to-light-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,122,255,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,73,153,0.1)_0%,transparent_50%)]" />
        
        
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-dark-secondary/10 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-tr from-dark-primary/10 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,73,153,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,73,153,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      
      <div className="relative z-10 w-full p-4 sm:p-6 md:p-8">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-inter font-bold inline-block">
            <span 
              className="bg-gradient-to-r from-dark-primary via-dark-secondary to-dark-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,73,153,0.1))'
              }}
            >
              Apex Hire
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-light-secondary text-sm sm:text-base mt-2 font-medium"
          >
            AI-Powered Interview Platform
          </motion.p>
        </motion.div>

        
        <motion.header
          className="mb-10 mx-auto w-fit"
          initial={{ y: -50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
        >
          <div className="relative">
            
            <div className="absolute inset-0 bg-gradient-to-r from-dark-primary/20 via-dark-secondary/20 to-dark-primary/20 blur-xl rounded-3xl" />
            
            <nav className="relative bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-2 shadow-2xl shadow-black/5">
              <div className="flex space-x-2">
                <TabButton
                  to="/"
                  label="Interviewee"
                  isActive={isIntervieweeActive}
                  onClick={() => navigate('/')}
                />
                <TabButton
                  to="/dashboard"
                  label="Interviewer"
                  isActive={isInterviewerActive}
                  onClick={() => navigate('/dashboard')}
                />
              </div>
            </nav>
          </div>
        </motion.header>

        
        <motion.main 
          className="flex-grow w-full max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="relative">
            
            <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/20 shadow-xl shadow-black/5">
              <Outlet />
            </div>
          </div>
        </motion.main>

        
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-dark-secondary to-transparent"
        />
      </div>
    </div>
  );
};

export default Layout;



