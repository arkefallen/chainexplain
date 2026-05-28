import { useEffect, useState } from 'react';
import useJobStore from '../store/useJobStore';
import { firestoreRepository } from '../repositories/firestore.repository';
import { jobDto } from '../dto/job.dto';
import { devLogger } from '../utils/devLogger';
import useJobPolling from './useJobPolling';

/**
 * Facade hook that manages subscription to real-time job processing states in Firestore.
 * Seamlessly falls back to useJobPolling if Firestore encounters database connection issues
 * or is unavailable.
 */
export default function useFirestoreListener() {
  const currentJobId = useJobStore((state) => state.currentJobId);
  const updateFromFirestore = useJobStore((state) => state.updateFromFirestore);

  // Connection health flag to trigger standard REST polling fallback
  const [usePolling, setUsePolling] = useState(false);

  // If Firestore is not available, default to polling
  const firestoreUnavailable = !firestoreRepository.isAvailable();

  // 1. Delegate REST polling fallback if active or firestore unavailable
  useJobPolling(currentJobId, firestoreUnavailable || usePolling);

  useEffect(() => {
    // Return early if no active job ID, already polling, or firestore is unavailable
    if (!currentJobId || firestoreUnavailable || usePolling) return;

    devLogger.hook('useFirestoreListener', 'initializingFirestoreListener', { currentJobId });

    const unsubscribe = firestoreRepository.subscribeToJob(
      currentJobId,
      (rawData) => {
        // Map Firestore data shape to clean client state
        const normalizedData = jobDto.mapFirestoreSnapshot(rawData);
        
        devLogger.hook('useFirestoreListener', 'snapshotParsedUpdateStore', normalizedData);
        updateFromFirestore(normalizedData);
      },
      (err) => {
        devLogger.hook('useFirestoreListener', 'databaseSubscriptionFailedSwitchingToPolling', err.message);
        
        // Auto-heal and switch to API polling fallback
        setUsePolling(true);
      }
    );

    return () => {
      devLogger.hook('useFirestoreListener', 'unsubscribingFromFirestore');
      unsubscribe();
    };
  }, [currentJobId, firestoreUnavailable, usePolling, updateFromFirestore]);

  return null;
}
