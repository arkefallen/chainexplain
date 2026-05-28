import { apiRepository } from '../repositories/api.repository';
import { jobDto } from '../dto/job.dto';
import { JOB_STATUS } from '../constants/jobStatus';
import { devLogger } from '../utils/devLogger';

/**
 * Service to orchestrate job status fetching, pipeline step derivation,
 * and checking terminal status keys.
 */
export const jobService = {
  /**
   * Fetches job status from the API and normalizes it using DTO
   * 
   * @param {string} jobId - Unique job ID
   * @returns {Promise<Object>} Normalized job status details
   */
  async getJobStatus(jobId) {
    devLogger.service('JobService', 'getJobStatus', { jobId });
    
    try {
      const rawResponse = await apiRepository.getJobStatus(jobId);
      const normalizedData = jobDto.mapJobStatusResponse(rawResponse);
      
      devLogger.info('✅ Mapped job status details successfully:', { status: normalizedData.status });
      return normalizedData;
    } catch (err) {
      devLogger.info('❌ Service-level fetch status failed:', err.message);
      throw err;
    }
  },

  /**
   * Checks whether a status is terminal (completed or failed)
   * 
   * @param {string} status - Job status code
   * @returns {boolean} True if job is finished
   */
  isTerminalStatus(status) {
    const isTerminal = status === JOB_STATUS.COMPLETED || status === JOB_STATUS.FAILED;
    devLogger.service('JobService', 'isTerminalStatus', { status, isTerminal });
    return isTerminal;
  },

  /**
   * Translates active job status into the UI step index (0 to 4)
   * 
   * @param {string} status - Job status code
   * @returns {number} Active index (0 = Uploading, 1 = Extracting, 2 = Chunking, 3 = Summarizing, 4 = Completed, -1 = Idle/Failed)
   */
  calculateStepFromStatus(status) {
    let stepIndex = -1;

    switch (status) {
      case JOB_STATUS.PENDING:
      case JOB_STATUS.PROCESSING:
        stepIndex = 0;
        break;
      case JOB_STATUS.EXTRACTING:
        stepIndex = 1;
        break;
      case JOB_STATUS.CHUNKING:
        stepIndex = 2;
        break;
      case JOB_STATUS.SUMMARIZING:
        stepIndex = 3;
        break;
      case JOB_STATUS.COMPLETED:
        stepIndex = 4;
        break;
      default:
        stepIndex = -1;
    }

    devLogger.service('JobService', 'calculateStepFromStatus', { status, stepIndex });
    return stepIndex;
  }
};
