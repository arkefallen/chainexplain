import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Home } from 'lucide-react';
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

export default function ErrorPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Support both React Router state and URL query params for maximal flexibility
  const searchParams = new URLSearchParams(location.search);
  const errorCode = location.state?.code || searchParams.get('code') || 'PROCESS_FAILED_0x1';
  const errorMessage = location.state?.message || searchParams.get('message') || '';

  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-grow flex items-center justify-center py-12 px-4 z-10 relative"
    >
      {/* Glassmorphic Error Card (Level 2 Elevation with Glow) */}
      <motion.div
        variants={itemVariants}
        className="glass-card backdrop-blur-[16px] border border-border/30 rounded-xl p-8 md:p-12 max-w-[640px] w-full flex flex-col items-center text-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden group"
      >
        {/* Subtle Top Glow Bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        
        {/* Visual Error Indicator */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 blur-[20px] rounded-full group-hover:bg-primary/30 transition-colors duration-500"></div>
          <div className="relative z-10 h-16 w-16 flex items-center justify-center bg-primary/10 rounded-full border border-primary/20 drop-shadow-[0_0_12px_rgba(99,102,241,0.4)]">
            <AlertTriangle className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Dynamic Error Code Badge */}
        <div className="font-mono text-[11px] tracking-widest text-secondary uppercase bg-secondary/10 border border-secondary/20 rounded-full px-4 py-1.5 mb-4 inline-flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
          {errorCode}
        </div>

        {/* Error Title */}
        <h1 className="font-sans font-extrabold text-2xl md:text-3xl text-foreground mb-4">
          Deconstruction Interrupted
        </h1>

        {/* Error Message */}
        <p className="font-sans text-sm md:text-base text-muted-foreground max-w-[480px] mb-6 leading-relaxed">
          We encountered an unexpected hurdle while processing the abstract data. The neural mapping protocol was unable to reach consensus, resulting in a temporary block disconnect.
        </p>

        {/* Raw System Error Message Display Component */}
        {errorMessage && (
          <motion.div
            variants={itemVariants}
            className="w-full text-left p-4 bg-slate-100/90 dark:bg-black/80 border border-slate-200 dark:border-border/60 rounded-lg text-xs font-mono mb-8 overflow-auto max-h-[160px] relative shadow-inner"
          >
            <div className="text-[10px] uppercase font-extrabold tracking-widest text-primary dark:text-primary mb-2.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              System Diagnostics Log
            </div>
            <div className="text-slate-800 dark:text-slate-100 break-all whitespace-pre-wrap leading-relaxed">
              {errorMessage}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Button
            size="lg"
            onClick={handleReturnHome}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-sans font-bold px-8 py-5 rounded-md hover:-translate-y-[2px] hover:shadow-[0_4px_20px_rgba(99,102,241,0.3)] transition-all duration-300 flex items-center justify-center gap-2 active:translate-y-[1px]"
          >
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
