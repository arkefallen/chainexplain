import { useEffect, useRef } from 'react';
import { jobService } from '../services/job.service';
import useJobStore from '../store/useJobStore';
import { devLogger } from '../utils/devLogger';
import { useNavigate } from 'react-router-dom';

/**
 * Fallback polling hook to monitor job status using standard REST API polls.
 * Active when Firestore real-time listener fails or is unavailable.
 * 
 * @param {string} jobId - Unique job ID to poll
 * @param {boolean} active - True if HTTP polling should be active
 */
export default function useJobPolling(jobId, active) {
  const updateFromFirestore = useJobStore((state) => state.updateFromFirestore);
  const setError = useJobStore((state) => state.setError);
  const navigate = useNavigate();
  
  // Keep a reference to the active state to check in async cycle
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    if (!active || !jobId) return;

    devLogger.hook('useJobPolling', 'startPollingLoop', { jobId });
    
    let timerId = null;
    let isMounted = true;

    const poll = async () => {
      if (!activeRef.current || !isMounted) return;

      try {
        devLogger.hook('useJobPolling', 'pollingTick', { jobId });
        const data = await jobService.getJobStatus(jobId);
        
        if (!isMounted) return;

        // Update Zustand store
        updateFromFirestore(data);

        // If status is terminal (COMPLETED/FAILED), stop the polling loop
        if (jobService.isTerminalStatus(data.status)) {
          devLogger.hook('useJobPolling', 'stopPollingLoopTerminalStatusReached', { status: data.status });
          return;
        }

        // Schedule next poll check — 5s interval to match slow AI processing time
        timerId = setTimeout(poll, 5000);
      } catch (err) {
        if (!isMounted) return;

        devLogger.hook('useJobPolling', 'pollFailed', err.message);
        setError(`Polling failed: ${err.message}`);
        
        // Extract status and message, redirect to error page
        const status = err.response?.status || 500;
        const message = err.response?.data?.error || err.response?.data?.message || err.message || "Unknown error from backend";
        
        navigate('/error', { state: { status, message } });
      }
    };

    // Trigger initial poll
    poll();

    return () => {
      isMounted = false;
      devLogger.hook('useJobPolling', 'cleanupPollingTimer');
      if (timerId) clearTimeout(timerId);
    };
  }, [jobId, active, updateFromFirestore, setError]);
}
