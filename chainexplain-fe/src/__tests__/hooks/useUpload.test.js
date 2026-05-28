import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useUpload from '../../hooks/useUpload';
import { uploadService } from '../../services/upload.service';
import useJobStore from '../../store/useJobStore';

// Mock upload service
vi.mock('../../services/upload.service', () => {
  return {
    uploadService: {
      uploadWhitepaper: vi.fn()
    }
  };
});

// Mock Zustand store triggers
vi.mock('../../store/useJobStore', () => {
  const mockSetState = vi.fn();
  const mockStore = vi.fn((selector) => {
    const fakeState = {
      startUpload: vi.fn().mockName('startUpload'),
      setUploadedFile: vi.fn().mockName('setUploadedFile'),
      setJobId: vi.fn().mockName('setJobId'),
      setError: vi.fn().mockName('setError'),
    };
    return selector(fakeState);
  });
  return {
    default: mockStore
  };
});

describe('useUpload Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'real-api-key');
  });

  it('should upload file successfully and update store with jobId', async () => {
    const file = new File(['pdf-body'], 'test.pdf', { type: 'application/pdf' });
    const mockUploadResult = { jobId: 'job-789', status: 'PENDING', fileName: 'test.pdf' };
    
    uploadService.uploadWhitepaper.mockResolvedValueOnce(mockUploadResult);

    const { result } = renderHook(() => useUpload());

    await act(async () => {
      await result.current.uploadFile(file);
    });

    expect(uploadService.uploadWhitepaper).toHaveBeenCalledWith(file);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploadError).toBeNull();
  });

  it('should handle service errors, set hook errors and throw', async () => {
    const file = new File(['pdf-body'], 'test.pdf', { type: 'application/pdf' });
    const serviceError = new Error('File parse failed');
    
    uploadService.uploadWhitepaper.mockRejectedValueOnce(serviceError);

    const { result } = renderHook(() => useUpload());

    await act(async () => {
      await expect(result.current.uploadFile(file)).rejects.toThrow('File parse failed');
    });

    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploadError).toBe('File parse failed');
  });

  it('should early return if no file is provided', async () => {
    const { result } = renderHook(() => useUpload());

    await act(async () => {
      await result.current.uploadFile(null);
    });

    expect(uploadService.uploadWhitepaper).not.toHaveBeenCalled();
    expect(result.current.isUploading).toBe(false);
  });
});
