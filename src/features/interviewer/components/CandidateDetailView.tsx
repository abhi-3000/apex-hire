import React from 'react';
import type { Candidate } from '@/store/slices/candidatesSlice';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, type Variants } from 'framer-motion';
import { User, Mail, Phone, FileText, Star, MessageSquare } from 'lucide-react';

interface CandidateDetailViewProps {
  candidate: Candidate | null;
}

const CandidateDetailView: React.FC<CandidateDetailViewProps> = ({ candidate }) => {
  if (!candidate) {
    return null;
  }
  
  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500';
    const percentage = (score / 10) * 100;
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-blue-500';
    if (percentage >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const containerVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div
      className="flex flex-col gap-6 font-inter"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      
      {/* --- THE FIX: Profile & Summary Section are now in a single-column container --- */}
      <motion.div variants={itemVariants} className="w-full space-y-6">
        <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-lg h-full">
          <CardHeader className="flex flex-row items-center gap-4">
            <User className="w-6 h-6 text-dark-primary" />
            <div>
              <CardTitle className="text-xl">{candidate.details.name}</CardTitle>
              <CardDescription className="font-medium">Candidate Profile</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-light-secondary" />
              <span>{candidate.details.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-light-secondary" />
              <span>{candidate.details.phone}</span>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Star className="w-4 h-4 text-light-secondary" />
              <span className="font-semibold">Final Score: <span className="text-dark-secondary font-bold">{candidate.totalScore} / 60</span></span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-xl border-white/30 shadow-lg h-full">
          <CardHeader className="flex flex-row items-center gap-4">
            <FileText className="w-6 h-6 text-dark-primary" />
            <div>
              <CardTitle className="text-xl">AI Summary</CardTitle>
              <CardDescription className="font-medium">Performance Overview</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{candidate.finalSummary}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* --- Full Transcript Section --- */}
      <motion.div variants={itemVariants} className="w-full flex-1">
        <Card className="h-full flex flex-col bg-white/70 backdrop-blur-xl border-white/30 shadow-lg">
          <CardHeader className="flex flex-row items-center gap-4">
             <MessageSquare className="w-6 h-6 text-dark-primary" />
             <div>
              <CardTitle className="text-xl">Interview Transcript</CardTitle>
              <CardDescription className="font-medium">Question & Answer Breakdown</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-4 custom-scrollbar">
              <div className="space-y-6">
                {candidate.questions.map((q, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-black">
                        Q{index + 1}: {q.text}
                      </p>
                      <Badge variant="secondary" className="capitalize">{q.difficulty}</Badge>
                    </div>
                    <div className="p-4 bg-white/80 rounded-lg border border-white/50 shadow-inner">
                      <p className="text-sm text-gray-800">{q.answer}</p>
                    </div>
                    <div className="text-right mt-2">
                      <p className={`text-sm font-bold ${getScoreColor(q.score)}`}>
                        Score: {q.score}/10
                      </p>
                      <p className="text-xs text-gray-500 italic">{q.justification}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CandidateDetailView;

