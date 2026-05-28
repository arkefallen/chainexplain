import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadService } from '../../services/upload.service';
import { apiRepository } from '../../repositories/api.repository';
import { jobDto } from '../../dto/job.dto';
import { ApiError } from '../../errors/ApiError';

// Mock repository
vi.mock('../../repositories/api.repository', () => {
  return {
    apiRepository: {
      uploadPdf: vi.fn()
    }
  };
});

// Mock DTO
vi.mock('../../dto/job.dto', () => {
  return {
    jobDto: {
      mapUploadResponse: vi.fn()
    }
  };
});

describe('uploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadWhitepaper', () => {
    it('should successfully upload valid PDF file', async () => {
      const file = new File(['dummy pdf data'], 'bitcoin.pdf', { type: 'application/pdf' });
      const apiResponse = { success: true };
      const normalizedResult = { jobId: 'job-123', status: 'PENDING', fileName: 'bitcoin.pdf' };

      apiRepository.uploadPdf.mockResolvedValueOnce(apiResponse);
      jobDto.mapUploadResponse.mockReturnValueOnce(normalizedResult);

      const result = await uploadService.uploadWhitepaper(file);

      expect(apiRepository.uploadPdf).toHaveBeenCalledWith(file);
      expect(jobDto.mapUploadResponse).toHaveBeenCalledWith(apiResponse);
      expect(result).toEqual(normalizedResult);
    });

    it('should throw ApiError if file is not provided', async () => {
      await expect(uploadService.uploadWhitepaper(null))
        .rejects
        .toThrow(new ApiError('Please select a file to upload.'));
        
      expect(apiRepository.uploadPdf).not.toHaveBeenCalled();
    });

    it('should throw ApiError if file type is not PDF', async () => {
      const file = new File(['dummy txt'], 'bitcoin.txt', { type: 'text/plain' });

      await expect(uploadService.uploadWhitepaper(file))
        .rejects
        .toThrow(new ApiError('Only PDF documents are supported. Please choose a valid PDF file.'));

      expect(apiRepository.uploadPdf).not.toHaveBeenCalled();
    });

    it('should throw ApiError if file size exceeds 10MB', async () => {
      // 11MB file size
      const largeSize = 11 * 1024 * 1024;
      const file = {
        name: 'heavy.pdf',
        size: largeSize,
        type: 'application/pdf'
      };

      await expect(uploadService.uploadWhitepaper(file))
        .rejects
        .toThrow(expect.objectContaining({
          message: expect.stringContaining('11.00MB')
        }));

      expect(apiRepository.uploadPdf).not.toHaveBeenCalled();
    });

    it('should propagate errors thrown from repository level', async () => {
      const file = new File(['dummy data'], 'bitcoin.pdf', { type: 'application/pdf' });
      const apiError = new ApiError('Network Failure', null, { isNetworkError: true });
      
      apiRepository.uploadPdf.mockRejectedValueOnce(apiError);

      await expect(uploadService.uploadWhitepaper(file))
        .rejects
        .toThrow(apiError);
    });
  });
});
