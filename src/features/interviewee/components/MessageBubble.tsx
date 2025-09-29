import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface MessageBubbleProps {
  sender: 'ai' | 'user';
  message: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ sender, message }) => {
  const isAI = sender === 'ai';

  const bubbleClasses = clsx(
    'px-5 py-3 rounded-2xl max-w-[85%] sm:max-w-[75%] break-words shadow-lg border border-white/20 font-inter text-base',
    {
      'bg-white/70 backdrop-blur-xl text-black self-start rounded-bl-lg': isAI,
      'bg-gradient-to-r from-dark-primary to-dark-secondary text-light-primary self-end rounded-br-lg': !isAI,
    }
  );

  return (
    <motion.div
      className={bubbleClasses}
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
  
      <p style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
    </motion.div>
  );
};

export default MessageBubble;






