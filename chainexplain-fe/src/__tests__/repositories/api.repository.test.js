import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRepository } from '../../repositories/api.repository';
import httpClient from '../../services/httpClient';

// Mock the httpClient instance
vi.mock('../../services/httpClient', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
    }
  };
});

describe('apiRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadPdf', () => {
    it('should call post /api/upload with FormData and return response', async () => {
      const file = new File(['dummy content'], 'bitcoin.pdf', { type: 'application/pdf' });
      const expectedResponse = { success: true, data: { jobId: 'job-123', status: 'PENDING' } };
      
      httpClient.post.mockResolvedValueOnce(expectedResponse);

      const result = await apiRepository.uploadPdf(file);

      expect(httpClient.post).toHaveBeenCalledWith('/api/upload', expect.any(FormData));
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getJobStatus', () => {
    it('should call get /api/jobs/:jobId and return response', async () => {
      const expectedResponse = { success: true, data: { id: 'job-123', status: 'PROCESSING' } };
      
      httpClient.get.mockResolvedValueOnce(expectedResponse);

      const result = await apiRepository.getJobStatus('job-123');

      expect(httpClient.get).toHaveBeenCalledWith('/api/jobs/job-123');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('checkHealth', () => {
    it('should call get /api/health and return response', async () => {
      const expectedResponse = { status: 'ok' };
      
      httpClient.get.mockResolvedValueOnce(expectedResponse);

      const result = await apiRepository.checkHealth();

      expect(httpClient.get).toHaveBeenCalledWith('/api/health');
      expect(result).toEqual(expectedResponse);
    });
  });
});
