import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, RotateCw, Loader, AlertTriangle, ArrowLeft } from 'lucide-react';
import useJobStore from '../store/useJobStore';
import useFirestoreListener from '../hooks/useFirestoreListener';
import { JOB_STATUS } from '../constants/jobStatus';
import { jobService } from '../services/job.service';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const FUNNY_MESSAGES = {
  [JOB_STATUS.PENDING]: [
    'Lining up in the blockchain queue...',
    'Securing standard node connection...',
    'Checking network gas fees (just kidding, it is free!)...'
  ],
  [JOB_STATUS.PROCESSING]: [
    'Initializing simplification workers...',
    'Validating state proofs...'
  ],
  [JOB_STATUS.EXTRACTING]: [
    'Reading alien languages...',
    'Translating cryptographic runes into human speech...',
    'Scanning document formulas and diagrams...'
  ],
  [JOB_STATUS.CHUNKING]: [
    'Chopping the document into neat little pieces...',
    'Slicing the paper into digestible byte-sized sections...',
    'Organizing semantic boundaries to preserve context...'
  ],
  [JOB_STATUS.SUMMARIZING]: [
    'Crafting silly analogies for 5-year-olds...',
    'Whispering to DeepSeek to explain it to a kindergarten class...',
    'Replacing complex financial jargon with sandbox analogies...'
  ],
  [JOB_STATUS.FAILED]: [
    'Something exploded on the network...',
    'The AI got confused by too much rocket science. Let\'s retry.'
  ]
};

export default function ProcessingPage() {
  const navigate = useNavigate();

  // Start the firestore snapshot listener / REST polling fallback automatically
  useFirestoreListener();

  const currentJobId = useJobStore((state) => state.currentJobId);
  const jobStatus = useJobStore((state) => state.jobStatus);
  const progress = useJobStore((state) => state.progress);
  const error = useJobStore((state) => state.error);
  const reset = useJobStore((state) => state.reset);

  const [message, setMessage] = useState('Initializing explainer pipeline...');

  // Cycle funny messages depending on status
  useEffect(() => {
    if (!jobStatus) return;

    const messageList = FUNNY_MESSAGES[jobStatus] || ['Processing and translating...'];
    let index = 0;
    setMessage(messageList[0]);

    const interval = setInterval(() => {
      index = (index + 1) % messageList.length;
      setMessage(messageList[index]);
    }, 6000); // 6s cycle — AI is slow, enjoy the wait messages wkwkwk

    return () => clearInterval(interval);
  }, [jobStatus]);

  // Redirect to result page when complete
  useEffect(() => {
    if (jobStatus === JOB_STATUS.COMPLETED) {
      const delay = setTimeout(() => {
        navigate('/result');
      }, 800); // slight delay to show 100% progress
      return () => clearTimeout(delay);
    }
  }, [jobStatus, navigate]);

  const handleBackToUpload = () => {
    reset();
    navigate('/upload');
  };

  // Determine active step indicators using constants
  const steps = [
    { 
      label: 'Uploading Whitepaper', 
      status: [
        JOB_STATUS.PENDING, 
        JOB_STATUS.PROCESSING, 
        JOB_STATUS.EXTRACTING, 
        JOB_STATUS.CHUNKING, 
        JOB_STATUS.SUMMARIZING, 
        JOB_STATUS.COMPLETED
      ] 
    },
    { 
      label: 'Extracting PDF Text', 
      status: [
        JOB_STATUS.EXTRACTING, 
        JOB_STATUS.CHUNKING, 
        JOB_STATUS.SUMMARIZING, 
        JOB_STATUS.COMPLETED
      ] 
    },
    { 
      label: 'Recursive Chunking', 
      status: [
        JOB_STATUS.CHUNKING, 
        JOB_STATUS.SUMMARIZING, 
        JOB_STATUS.COMPLETED
      ] 
    },
    { 
      label: 'AI ELI5 Summarizing', 
      status: [
        JOB_STATUS.SUMMARIZING, 
        JOB_STATUS.COMPLETED
      ] 
    }
  ];

  const getStepStatus = (stepIndex, activeStatus) => {
    // If completed, all preceding steps are checkmarks
    if (activeStatus === JOB_STATUS.COMPLETED) return 'checked';

    // If failed, return idle (no checks shown for failed ones)
    if (activeStatus === JOB_STATUS.FAILED) return 'idle';

    const stepInfo = steps[stepIndex];
    const isCurrentlyActive = stepInfo.status[0] === activeStatus;

    // Check if the current status has reached or passed this step
    const hasBeenReached = stepInfo.status.includes(activeStatus);

    if (isCurrentlyActive) return 'loading';
    if (hasBeenReached) return 'checked';
    return 'idle';
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-10 py-4 md:py-8 text-center justify-center items-center">
      {/* Title */}
      <div className="flex flex-col gap-2 w-full text-left">
        <h1 className="font-sans text-2xl font-extrabold tracking-tight text-foreground">
          Simplification Pipeline
        </h1>
        <p className="font-sans text-xs font-mono text-muted-foreground truncate uppercase">
          JOB_ID: {currentJobId || 'UNINITIALIZED'}
        </p>
      </div>

      {/* Main Status Panel */}
      <div className="w-full min-h-[460px] glass rounded-lg p-6 md:p-8 flex flex-col items-center border border-border shadow-2xl relative overflow-hidden">
        {/* Glow behind processor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-primary/5 blur-[50px] -z-10" />

        {/* Dynamic AI loader with infinite micro-loop rotation */}
        {jobStatus !== JOB_STATUS.FAILED ? (
          <div className="relative flex items-center justify-center h-20 w-20 mb-8">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute h-14 w-14 rounded-full border-2 border-primary/40 border-t-primary"
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg">
              <Loader className="h-4 w-4 animate-spin" />
            </div>
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 text-destructive mb-8">
            <AlertTriangle className="h-10 w-10" />
          </div>
        )}

        {/* Status Text */}
        <h2 className="font-sans text-base font-bold text-foreground mb-1.5 min-h-[24px]">
          {jobStatus === JOB_STATUS.FAILED 
            ? 'Processing Interrupted' 
            : jobStatus === JOB_STATUS.COMPLETED 
            ? 'Simplification Complete!' 
            : 'Processing Whitepaper'}
        </h2>
        <p className="font-sans text-xs text-muted-foreground leading-relaxed h-[40px] px-4 max-w-sm mb-6">
          {message}
        </p>

        {/* Progress Bar */}
        <div className="w-full flex flex-col gap-2 mb-8">
          <div className="flex justify-between font-mono text-[10px] text-muted-foreground/70">
            <span>PIPELINE PROGRESS</span>
            <span className="font-bold text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-secondary transition-all" />
        </div>

        {/* Steps Checklist */}
        <div className="w-full flex flex-col gap-3.5 border-t border-border pt-6 items-stretch text-left">
          {steps.map((step, idx) => {
            const stepState = getStepStatus(idx, jobStatus);

            return (
              <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3">
                  {stepState === 'checked' ? (
                    <CheckCircle2 className="h-4.5 w-4.5 text-accent flex-shrink-0" />
                  ) : stepState === 'loading' ? (
                    <RotateCw className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-border flex-shrink-0" />
                  )}
                  <span
                    className={`font-sans font-medium transition-colors ${
                      stepState === 'checked'
                        ? 'text-muted-foreground/80 line-through'
                        : stepState === 'loading'
                        ? 'text-primary font-bold'
                        : 'text-muted-foreground/45'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {stepState === 'loading' && (
                  <span className="font-mono text-[9px] uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary rounded px-1.5 py-0.5 animate-pulse">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Skeletal Shimmer Preview Panel */}
      {(jobStatus === JOB_STATUS.CHUNKING || jobStatus === JOB_STATUS.SUMMARIZING) && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full glass rounded-lg p-6 flex flex-col gap-4 border border-border shadow-xl text-left"
        >
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="h-5 w-5 rounded bg-white/5 animate-pulse" />
            <Skeleton className="h-4 w-36 bg-white/5 animate-pulse" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full bg-white/5 animate-pulse" />
            <Skeleton className="h-3.5 w-11/12 bg-white/5 animate-pulse" />
            <Skeleton className="h-3.5 w-4/5 bg-white/5 animate-pulse" />
          </div>
          <div className="space-y-2 mt-2">
            <Skeleton className="h-3.5 w-11/12 bg-white/5 animate-pulse" />
            <Skeleton className="h-3.5 w-3/4 bg-white/5 animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* Error Retry Layout */}
      {jobStatus === JOB_STATUS.FAILED && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col gap-4 bg-destructive/5 border border-destructive/10 rounded-lg p-5 text-left"
        >
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1.5">
              <span className="font-sans font-bold text-sm text-foreground">Pipeline Error Report</span>
              <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                {error || 'The connection timed out during DeepSeek summarization. Please check your internet or retry.'}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleBackToUpload}
            className="self-start mt-2 px-5 font-sans font-semibold bg-card hover:bg-muted border border-border text-foreground transition-all active:scale-98"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Upload and Try Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
