import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useAppSelector } from '../../hooks/reduxHooks';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CandidateDetailView from './components/CandidateDetailView';
import type { Candidate } from '@/store/slices/candidatesSlice';
import { format } from 'date-fns';
import { ArrowUpDown, Search, Users, Award, Calendar, Mail } from 'lucide-react';

type SortConfig = {
  key: keyof Candidate | 'details.name' | 'totalScore';
  direction: 'ascending' | 'descending';
};

const InterviewerPage: React.FC = () => {
  const candidates = useAppSelector((state) => state.candidates.list);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'totalScore', direction: 'descending' });
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const filteredAndSortedCandidates = useMemo(() => {
    let sortableCandidates = [...candidates];

    if (searchTerm) {
      sortableCandidates = sortableCandidates.filter(candidate =>
        candidate.details.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.details.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    sortableCandidates.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.key === 'details.name') {
        aValue = a.details.name || '';
        bValue = b.details.name || '';
      } else {
        aValue = a[sortConfig.key as keyof Candidate] || 0;
        bValue = b[sortConfig.key as keyof Candidate] || 0;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    return sortableCandidates;
  }, [candidates, searchTerm, sortConfig]);

  const requestSort = (key: SortConfig['key']) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const containerVariants: Variants = {
    initial: { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1 } },
  };

  const rowVariants: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 },
    }),
    hover: { backgroundColor: 'rgba(0, 122, 255, 0.02)', transition: { duration: 0.2 } },
  };

  const getScoreGradient = (score: number | null) => {
    if (score === null) return 'from-gray-400 to-gray-500';
    const percentage = (score / 60) * 100;
    if (percentage >= 80) return 'from-green-500 to-emerald-500';
    if (percentage >= 60) return 'from-blue-500 to-cyan-500';
    if (percentage >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <motion.div
      className="relative w-full max-w-7xl mx-auto flex flex-col h-[calc(100vh-200px)] min-h-[500px]"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="absolute inset-0 overflow-hidden rounded-[40px] pointer-events-none">
        <motion.div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-dark-secondary/5 to-transparent rounded-full blur-3xl" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-dark-primary/5 to-transparent rounded-full blur-3xl" animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} />
      </div>

      <motion.div
        className="relative bg-white/60 backdrop-blur-2xl rounded-[40px] shadow-2xl w-full h-full p-6 sm:p-8 md:p-10 border border-white/30 overflow-hidden"
        style={{ boxShadow: '0 20px 60px -15px rgba(0, 73, 153, 0.15), 0 10px 40px -10px rgba(0, 122, 255, 0.1)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-dark-secondary/[0.02] via-transparent to-dark-primary/[0.02] rounded-[40px] pointer-events-none" />

        <motion.div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex items-center gap-3">
            <motion.div className="p-3 bg-gradient-to-br from-dark-primary to-dark-secondary rounded-2xl shadow-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Users className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-inter font-bold">
                <span className="bg-gradient-to-r from-dark-primary via-dark-secondary to-dark-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient">
                  Candidate Dashboard
                </span>
              </h2>
              <p className="text-light-secondary text-sm mt-1">
                {candidates.length} total candidates
              </p>
            </div>
          </div>

          <motion.div className="relative w-full sm:w-[350px]" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <div className="absolute inset-0 bg-gradient-to-r from-dark-primary/10 to-dark-secondary/10 rounded-2xl blur-xl" />
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-light-secondary z-10" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-xl border-white/50 rounded-2xl shadow-lg placeholder:text-light-secondary/70 focus:ring-2 focus:ring-dark-secondary/30 focus:border-dark-secondary/30 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)' }}
              />
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div className="relative flex-grow bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl overflow-hidden shadow-inner" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-dark-secondary/30 to-transparent" />
          
          <div className="overflow-y-auto h-full custom-scrollbar">
            <Dialog>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-light-secondary/10 bg-gradient-to-r from-dark-primary/5 via-transparent to-dark-secondary/5">
                    <TableHead className="py-4">
                      <Button variant="ghost" onClick={() => requestSort('details.name')} className="group hover:bg-white/50 rounded-xl transition-all duration-300">
                        <Users className="w-4 h-4 mr-2 text-dark-primary" />
                        <span className="font-semibold bg-gradient-to-r from-dark-primary to-dark-secondary bg-clip-text text-transparent">
                          Candidate Name
                        </span>
                        <ArrowUpDown className="ml-2 h-4 w-4 text-light-secondary group-hover:text-dark-secondary transition-colors" />
                      </Button>
                    </TableHead>
                    <TableHead className="py-4">
                      <div className="flex items-center gap-2 text-light-secondary font-semibold">
                        <Mail className="w-4 h-4" />
                        Email
                      </div>
                    </TableHead>
                    <TableHead className="text-center py-4">
                      <Button variant="ghost" onClick={() => requestSort('totalScore')} className="group hover:bg-white/50 rounded-xl transition-all duration-300">
                        <Award className="w-4 h-4 mr-2 text-dark-primary" />
                        <span className="font-semibold bg-gradient-to-r from-dark-primary to-dark-secondary bg-clip-text text-transparent">
                          Final Score
                        </span>
                        <ArrowUpDown className="ml-2 h-4 w-4 text-light-secondary group-hover:text-dark-secondary transition-colors" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-center py-4">
                      <div className="flex items-center justify-center gap-2 text-light-secondary font-semibold">
                        <Calendar className="w-4 h-4" />
                        Completed On
                      </div>
                    </TableHead>
                    <TableHead className="text-right py-4">
                      <span className="text-light-secondary font-semibold">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredAndSortedCandidates.length > 0 ? (
                      filteredAndSortedCandidates.map((candidate, index) => (
                        <motion.tr
                          key={candidate.id}
                          layout
                          custom={index}
                          variants={rowVariants}
                          initial="initial"
                          animate="animate"
                          exit={{ opacity: 0, x: -20 }}
                          onHoverStart={() => setHoveredRow(candidate.id)}
                          onHoverEnd={() => setHoveredRow(null)}
                          className="border-b border-light-secondary/5 transition-all duration-300"
                          style={{
                            background: hoveredRow === candidate.id 
                              ? 'linear-gradient(90deg, rgba(0,122,255,0.03) 0%, rgba(0,73,153,0.03) 100%)' 
                              : 'transparent'
                          }}
                        >
                          <TableCell className="font-medium py-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-dark-primary/20 to-dark-secondary/20 rounded-full flex items-center justify-center">
                                <span className="text-dark-primary font-semibold">
                                  {candidate.details.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-black font-semibold">{candidate.details.name}</span>
                            </motion.div>
                          </TableCell>
                          <TableCell className="py-4 text-light-secondary">{candidate.details.email}</TableCell>
                          <TableCell className="text-center py-4">
                            <motion.div className="inline-flex items-center gap-2" whileHover={{ scale: 1.05 }}>
                              <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getScoreGradient(candidate.totalScore)} text-white font-bold shadow-lg`}>
                                {candidate.totalScore} / 60
                              </div>
                            </motion.div>
                          </TableCell>
                          <TableCell className="text-center py-4 text-light-secondary">
                            {format(new Date(candidate.completedAt), "PPpp")}
                          </TableCell>
                          <TableCell className="text-right py-4">
                            <DialogTrigger asChild>
                              <motion.button
                                onClick={() => setSelectedCandidate(candidate)}
                                className="px-6 py-2.5 bg-gradient-to-r from-dark-primary to-dark-secondary text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                View Details
                              </motion.button>
                            </DialogTrigger>
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center">
                          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-light-secondary/20 to-light-secondary/10 rounded-full flex items-center justify-center">
                              <Users className="w-8 h-8 text-light-secondary" />
                            </div>
                            <p className="text-light-secondary font-medium">No candidates found</p>
                            {searchTerm && (
                              <p className="text-light-secondary/70 text-sm">
                                Try adjusting your search criteria
                              </p>
                            )}
                          </motion.div>
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
              
              
              <DialogContent className="max-w-4xl h-[90vh] md:max-h-[85vh] flex flex-col bg-white/95 backdrop-blur-2xl border-white/50 rounded-3xl shadow-2xl">
                <DialogHeader className="pb-4 border-b border-light-secondary/10">
                  <DialogTitle className="text-2xl font-bold">
                    <span className="bg-gradient-to-r from-dark-primary to-dark-secondary bg-clip-text text-transparent">
                      Candidate Report
                    </span>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                  <CandidateDetailView candidate={selectedCandidate} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default InterviewerPage;

