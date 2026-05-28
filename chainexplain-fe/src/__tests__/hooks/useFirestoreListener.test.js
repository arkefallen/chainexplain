import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useFirestoreListener from '../../hooks/useFirestoreListener';
import { firestoreRepository } from '../../repositories/firestore.repository';
import useJobStore from '../../store/useJobStore';

// Mock repositories
vi.mock('../../repositories/firestore.repository', () => {
  return {
    firestoreRepository: {
      subscribeToJob: vi.fn().mockReturnValue(vi.fn().mockName('unsubscribe')),
      isAvailable: vi.fn().mockReturnValue(true)
    }
  };
});

// Mock Zustand store triggers
vi.mock('../../store/useJobStore', () => {
  const mockStore = vi.fn((selector) => {
    const fakeState = {
      currentJobId: 'job-123',
      updateFromFirestore: vi.fn(),
      setError: vi.fn()
    };
    return selector(fakeState);
  });
  return {
    default: mockStore
  };
});

// Mock nested hooks
vi.mock('../../hooks/useMockSimulation', () => {
  return {
    default: vi.fn()
  };
});

vi.mock('../../hooks/useJobPolling', () => {
  return {
    default: vi.fn()
  };
});

describe('useFirestoreListener Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Simulate real environment for testing real subscription
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'valid-api-key');
  });

  it('should subscribe to firestore repository when mounted with real jobId and ready Firebase', () => {
    renderHook(() => useFirestoreListener());

    expect(firestoreRepository.subscribeToJob).toHaveBeenCalledWith(
      'job-123',
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('should unsubscribe on unmount', () => {
    const mockUnsubscribe = vi.fn();
    vi.mocked(firestoreRepository.subscribeToJob).mockReturnValueOnce(mockUnsubscribe);

    const { unmount } = renderHook(() => useFirestoreListener());
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
