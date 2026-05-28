import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import useJobStore from '../store/useJobStore';
import SummaryCard from '../components/result/SummaryCard';
import LanguageToggle from '../components/result/LanguageToggle';
import ChunkAccordion from '../components/result/ChunkAccordion';
import CopyButton from '../components/result/CopyButton';
import { Button } from '@/components/ui/button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
};

export default function ResultPage() {
  const navigate = useNavigate();

  const summaryId = useJobStore((state) => state.summaryId);
  const summaryEn = useJobStore((state) => state.summaryEn);
  const chaptersId = useJobStore((state) => state.chaptersId);
  const chaptersEn = useJobStore((state) => state.chaptersEn);
  const activeLang = useJobStore((state) => state.activeLang);
  const uploadedFile = useJobStore((state) => state.uploadedFile);
  const projectName = useJobStore((state) => state.projectName);
  const reset = useJobStore((state) => state.reset);

  // Redirect back to upload if no content is loaded
  useEffect(() => {
    if (!summaryId && !summaryEn) {
      console.warn("No active explanation found in store. Redirecting to upload.");
      navigate('/upload');
    }
  }, [summaryId, summaryEn, navigate]);

  if (!summaryId && !summaryEn) {
    return null;
  }

  const activeSummary = activeLang === 'id' ? summaryId : summaryEn;
  const activeChapters = activeLang === 'id' ? chaptersId : chaptersEn;
  const fileName = uploadedFile?.name || 'bitcoin_whitepaper.pdf';
  const displayName = projectName || fileName.replace('.pdf', '');

  const handleUploadAnother = () => {
    reset();
    navigate('/upload');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto flex flex-col gap-8 py-4 md:py-8 text-left"
    >
      {/* Top Meta Info Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 border-b border-border pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-accent/15 flex items-center justify-center text-accent">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-widest text-accent font-bold">Pipeline Successful</span>
              <span className="font-sans font-bold text-sm text-foreground truncate max-w-[200px] sm:max-w-xs">
                {fileName}
              </span>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="flex items-center gap-3">
            <CopyButton textToCopy={activeSummary} />
            <LanguageToggle />
          </div>
        </div>
      </motion.div>

      {/* Project Explanation Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1.5 text-left mb-2">
        <h1 className="font-sans text-2xl md:text-3xl font-extrabold text-foreground">
          {displayName} Overview
        </h1>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed">
          Here is a simplified explanation of the core protocol and purpose of this project, tailored for absolute beginners.
        </p>
      </motion.div>

      {/* Main ELI5 Summary Panel */}
      <motion.div variants={itemVariants}>
        <SummaryCard summaryText={activeSummary} />
      </motion.div>

      {/* Detailed Section Accordions */}
      {activeChapters && activeChapters.length > 0 && (
        <motion.div variants={itemVariants}>
          <ChunkAccordion chapters={activeChapters} />
        </motion.div>
      )}

      {/* Actions footer */}
      <motion.div variants={itemVariants} className="flex justify-center border-t border-border pt-8 mt-4">
        <Button
          size="lg"
          onClick={handleUploadAnother}
          className="group px-6 py-5 bg-card hover:bg-muted border border-border text-foreground font-sans font-bold transition-all active:translate-y-[1px]"
        >
          <RefreshCw className="mr-2 h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
          Explain Another Whitepaper
        </Button>
      </motion.div>
    </motion.div>
  );
}
