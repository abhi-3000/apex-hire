import React, { useState, useRef, type DragEvent } from 'react'; // 1. THE FIX: Import DragEvent as a type
import { motion, type Variants } from 'framer-motion'; // 2. THE FIX: Import the Variants type
import { UploadCloud, FileText, X } from 'lucide-react';

interface ResumeUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onFileSelect, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (files: FileList | null) => {
    setError(null);
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setSelectedFile(file);
    } else {
      setError('Invalid file type. Please upload a PDF or DOCX file.');
      setSelectedFile(null);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleProcessResume = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };
  
  // 3. THE FIX: Explicitly type the variants object
  const containerVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  // 4. THE FIX: Explicitly type this variants object as well
  const itemVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div
      className="w-full max-w-xl mx-auto flex flex-col items-center justify-center p-6 h-full"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold font-inter text-center mb-3">
        <span className="bg-gradient-to-r from-dark-primary via-dark-secondary to-dark-primary bg-clip-text text-transparent">
          Begin Your Interview
        </span>
      </motion.h2>

      <motion.p variants={itemVariants} className="text-light-secondary text-center mb-8 max-w-md">
        Upload your resume to get started. We'll extract your details to personalize the experience.
      </motion.p>

      <motion.div variants={itemVariants} className="w-full">
        {!selectedFile ? (
          <motion.div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative w-full h-52 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
              ${isDragging ? 'border-dark-secondary bg-dark-secondary/10 scale-105' : 'border-light-secondary/30 hover:border-dark-secondary/50 hover:bg-dark-secondary/5'}`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-dark-primary/5 to-dark-secondary/5 opacity-50 rounded-3xl" />
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files)}
              className="hidden"
              accept=".pdf,.docx"
            />
            <motion.div 
              className="p-4 bg-white/50 backdrop-blur-sm rounded-full shadow-lg border border-white/30"
              animate={{ scale: isDragging ? 1.1 : 1 }}
            >
              <UploadCloud className="w-10 h-10 text-dark-primary" />
            </motion.div>
            <p className="font-semibold text-black mt-4">Drag & Drop or Click to Upload</p>
            <p className="text-sm text-light-secondary">PDF or DOCX accepted</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-4 bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <FileText className="w-6 h-6 text-dark-secondary flex-shrink-0" />
              <span className="font-medium text-black truncate">{selectedFile.name}</span>
            </div>
            <motion.button 
              onClick={() => setSelectedFile(null)} 
              className="text-light-secondary hover:text-black p-1 rounded-full hover:bg-black/5"
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </motion.div>
      
      {error && <p className="text-red-500 mt-4 text-sm font-medium">{error}</p>}

      <motion.button
        variants={itemVariants}
        onClick={handleProcessResume}
        disabled={!selectedFile || isLoading}
        className="mt-8 w-full max-w-sm py-4 rounded-2xl bg-gradient-to-r from-dark-primary to-dark-secondary text-light-primary font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300"
        whileHover={{ scale: (!!selectedFile && !isLoading) ? 1.05 : 1, y: (!!selectedFile && !isLoading) ? -2 : 0, boxShadow: '0 10px 20px rgba(0, 122, 255, 0.25)' }}
        whileTap={{ scale: (!!selectedFile && !isLoading) ? 0.98 : 1 }}
      >
        Process Resume
      </motion.button>
    </motion.div>
  );
};

export default ResumeUpload;




