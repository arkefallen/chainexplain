import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jobService } from '../../services/job.service';
import { apiRepository } from '../../repositories/api.repository';
import { jobDto } from '../../dto/job.dto';
import { JOB_STATUS } from '../../constants/jobStatus';

// Mock repository
vi.mock('../../repositories/api.repository', () => {
  return {
    apiRepository: {
      getJobStatus: vi.fn()
    }
  };
});

// Mock DTO
vi.mock('../../dto/job.dto', () => {
  return {
    jobDto: {
      mapJobStatusResponse: vi.fn()
    }
  };
});

describe('jobService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getJobStatus', () => {
    it('should successfully fetch raw job status and return mapped DTO results', async () => {
      const apiResponse = { success: true };
      const normalizedResult = { id: 'job-123', status: 'PROCESSING', progress: 50 };

      apiRepository.getJobStatus.mockResolvedValueOnce(apiResponse);
      jobDto.mapJobStatusResponse.mockReturnValueOnce(normalizedResult);

      const result = await jobService.getJobStatus('job-123');

      expect(apiRepository.getJobStatus).toHaveBeenCalledWith('job-123');
      expect(jobDto.mapJobStatusResponse).toHaveBeenCalledWith(apiResponse);
      expect(result).toEqual(normalizedResult);
    });

    it('should propagate errors from API Repository', async () => {
      const err = new Error('HTTP 404 Not Found');
      apiRepository.getJobStatus.mockRejectedValueOnce(err);

      await expect(jobService.getJobStatus('job-123'))
        .rejects
        .toThrow(err);
    });
  });

  describe('isTerminalStatus', () => {
    it('should return true for COMPLETED status', () => {
      expect(jobService.isTerminalStatus(JOB_STATUS.COMPLETED)).toBe(true);
    });

    it('should return true for FAILED status', () => {
      expect(jobService.isTerminalStatus(JOB_STATUS.FAILED)).toBe(true);
    });

    it('should return false for PENDING, PROCESSING, EXTRACTING, CHUNKING, SUMMARIZING statuses', () => {
      expect(jobService.isTerminalStatus(JOB_STATUS.PENDING)).toBe(false);
      expect(jobService.isTerminalStatus(JOB_STATUS.PROCESSING)).toBe(false);
      expect(jobService.isTerminalStatus(JOB_STATUS.EXTRACTING)).toBe(false);
      expect(jobService.isTerminalStatus(JOB_STATUS.CHUNKING)).toBe(false);
      expect(jobService.isTerminalStatus(JOB_STATUS.SUMMARIZING)).toBe(false);
    });
  });

  describe('calculateStepFromStatus', () => {
    it('should return 0 for PENDING and PROCESSING statuses', () => {
      expect(jobService.calculateStepFromStatus(JOB_STATUS.PENDING)).toBe(0);
      expect(jobService.calculateStepFromStatus(JOB_STATUS.PROCESSING)).toBe(0);
    });

    it('should return 1 for EXTRACTING status', () => {
      expect(jobService.calculateStepFromStatus(JOB_STATUS.EXTRACTING)).toBe(1);
    });

    it('should return 2 for CHUNKING status', () => {
      expect(jobService.calculateStepFromStatus(JOB_STATUS.CHUNKING)).toBe(2);
    });

    it('should return 3 for SUMMARIZING status', () => {
      expect(jobService.calculateStepFromStatus(JOB_STATUS.SUMMARIZING)).toBe(3);
    });

    it('should return 4 for COMPLETED status', () => {
      expect(jobService.calculateStepFromStatus(JOB_STATUS.COMPLETED)).toBe(4);
    });

    it('should return -1 for FAILED or IDLE status', () => {
      expect(jobService.calculateStepFromStatus(JOB_STATUS.FAILED)).toBe(-1);
      expect(jobService.calculateStepFromStatus(JOB_STATUS.IDLE)).toBe(-1);
      expect(jobService.calculateStepFromStatus('ANY_UNKNOWN_STATUS')).toBe(-1);
    });
  });
});
