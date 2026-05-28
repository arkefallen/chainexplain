import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firestoreRepository } from '../../repositories/firestore.repository';
import { onSnapshot, doc } from 'firebase/firestore';
import { isFirebaseAvailable } from '../../services/firebase';

// Mock Firebase Firestore SDK
vi.mock('firebase/firestore', () => {
  return {
    doc: vi.fn().mockReturnValue({ id: 'job-123', path: 'jobs/job-123' }),
    onSnapshot: vi.fn().mockImplementation((docRef, onData, onError) => {
      // Simulate real-time data push
      const mockDocSnap = {
        exists: () => true,
        data: () => ({ status: 'COMPLETED', progress: 100 })
      };
      
      onData(mockDocSnap);
      
      // Return a mock unsubscribe function
      return vi.fn().mockName('unsubscribe');
    })
  };
});

// Mock central firebase config service
vi.mock('../../services/firebase', () => {
  return {
    db: { type: 'mock-firestore-db' },
    isFirebaseAvailable: vi.fn().mockReturnValue(true)
  };
});

describe('firestoreRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isFirebaseAvailable).mockReturnValue(true);
  });

  describe('isAvailable', () => {
    it('should return true if firebase is initialized', () => {
      expect(firestoreRepository.isAvailable()).toBe(true);
      expect(isFirebaseAvailable).toHaveBeenCalled();
    });

    it('should return false if firebase is not ready', () => {
      vi.mocked(isFirebaseAvailable).mockReturnValueOnce(false);
      expect(firestoreRepository.isAvailable()).toBe(false);
    });
  });

  describe('subscribeToJob', () => {
    it('should successfully subscribe using onSnapshot and trigger onData with parsed document data', () => {
      const onData = vi.fn();
      const onError = vi.fn();

      const unsubscribe = firestoreRepository.subscribeToJob('job-123', onData, onError);

      expect(doc).toHaveBeenCalled();
      expect(onSnapshot).toHaveBeenCalled();
      expect(onData).toHaveBeenCalledWith({ status: 'COMPLETED', progress: 100 });
      expect(unsubscribe).toBeTypeOf('function');
    });

    it('should bypass subscription and trigger onError if Firebase is unavailable', () => {
      vi.mocked(isFirebaseAvailable).mockReturnValueOnce(false);
      
      const onData = vi.fn();
      const onError = vi.fn();

      const unsubscribe = firestoreRepository.subscribeToJob('job-123', onData, onError);

      expect(onSnapshot).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 'unavailable',
        isNetworkError: true
      }));
      expect(unsubscribe).toBeTypeOf('function');
      
      // Triggering returned unsubscribe should be a safe no-op
      expect(() => unsubscribe()).not.toThrow();
    });

    it('should trigger onError if the snapshot document does not exist', () => {
      // Temporarily override onSnapshot to simulate non-existing document
      vi.mocked(onSnapshot).mockImplementationOnce((docRef, onData, onError) => {
        const mockDocSnap = {
          exists: () => false
        };
        onData(mockDocSnap);
        return vi.fn();
      });

      const onData = vi.fn();
      const onError = vi.fn();

      firestoreRepository.subscribeToJob('job-123', onData, onError);

      expect(onError).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 'not-found'
      }));
    });
  });
});
