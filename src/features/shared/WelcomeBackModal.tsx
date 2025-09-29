import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WelcomeBackModalProps {
  isOpen: boolean;
  onResume: () => void;
  onStartOver: () => void;
}

const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({ isOpen, onResume, onStartOver }) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-inter font-bold">Welcome Back!</AlertDialogTitle>
          <AlertDialogDescription className="font-inter">
            It looks like you have an interview in progress. Would you like to resume where you left off or start over?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStartOver}>Start Over</AlertDialogCancel>
          <AlertDialogAction onClick={onResume}>Resume Interview</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WelcomeBackModal;
