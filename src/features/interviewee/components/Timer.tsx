import React from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  remainingTime: number;
  totalTime: number;
}

const Timer: React.FC<TimerProps> = ({ remainingTime, totalTime }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = (remainingTime / totalTime);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background Circle */}
        <circle
          className="text-gray-200"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        {/* Progress Circle */}
        <motion.circle
          className="text-dark-secondary"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold font-inter text-black">
          {remainingTime}
        </span>
      </div>
    </div>
  );
};

export default Timer;
