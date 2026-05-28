import { doc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseAvailable } from '../services/firebase';
import { devLogger } from '../utils/devLogger';
import { ApiError } from '../errors/ApiError';

/**
 * Repository for handling all direct real-time communication with Google Firestore database.
 * Abstracts Firestore SDK access from the custom hooks/services layer.
 */
export const firestoreRepository = {
  /**
   * Subscribes to real-time updates for a job document in Firestore
   * 
   * @param {string} jobId - ID of the job document in Firestore
   * @param {Function} onData - Success callback triggered when snapshot updates
   * @param {Function} onError - Error callback triggered on subscription failure
   * @returns {Function} Unsubscribe function to clean up the listener
   */
  subscribeToJob(jobId, onData, onError) {
    devLogger.repo('FirestoreRepository', 'subscribeToJob', { jobId });

    if (!isFirebaseAvailable()) {
      const err = new ApiError(
        'Firestore is currently unavailable (SDK is not initialized).',
        'unavailable',
        { isNetworkError: true }
      );
      onError(err);
      return () => {}; // return safe dummy unsubscribe
    }

    const docRef = doc(db, 'jobs', jobId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const rawData = docSnap.data();
          devLogger.repo('FirestoreRepository', 'onSnapshotReceived', { jobId, status: rawData.status });
          onData(rawData);
        } else {
          devLogger.repo('FirestoreRepository', 'onSnapshotNotFound', { jobId });
          // Trigger error if document is missing
          onError(new ApiError('Job process details were not found in the database.', 'not-found'));
        }
      },
      (err) => {
        devLogger.repo('FirestoreRepository', 'onSnapshotError', { jobId, error: err.message });
        // Normalize Firestore SDK error to ApiError
        const apiError = ApiError.fromFirestoreError(err);
        onError(apiError);
      }
    );

    // Return the cleanup unsubscribe wrapper
    return () => {
      devLogger.repo('FirestoreRepository', 'unsubscribeFromJob', { jobId });
      unsubscribe();
    };
  },

  /**
   * Helper function to check if the Firebase client is ready
   * @returns {boolean} True if Firebase database service is operational
   */
  isAvailable() {
    const available = isFirebaseAvailable();
    devLogger.repo('FirestoreRepository', 'isAvailable', { available });
    return available;
  }
};
