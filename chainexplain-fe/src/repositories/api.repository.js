import httpClient from '../services/httpClient';
import { devLogger } from '../utils/devLogger';

/**
 * Repository for handling all direct HTTP communication with the backend API.
 * Abstracts network requests from the service layer.
 */
export const apiRepository = {
  /**
   * Uploads a cryptocurrency whitepaper PDF file
   * @param {File} file - PDF file to upload
   * @returns {Promise<Object>} raw backend JSON response
   */
  async uploadPdf(file) {
    devLogger.repo('ApiRepository', 'uploadPdf', { fileName: file.name, fileSize: file.size });
    
    const formData = new FormData();
    formData.append('file', file);

    // POST /api/upload returns { success: true, data: { jobId, status, fileName } }
    return httpClient.post('/api/upload', formData);
  },

  /**
   * Fetches the current processing status and details of a job
   * @param {string} jobId - UUID of the job
   * @returns {Promise<Object>} raw backend JSON response
   */
  async getJobStatus(jobId) {
    devLogger.repo('ApiRepository', 'getJobStatus', { jobId });
    
    // GET /api/jobs/:jobId returns { success: true, data: { ... } }
    return httpClient.get(`/api/jobs/${jobId}`);
  },

  /**
   * Checks the backend API service health
   * @returns {Promise<Object>} raw health check status
   */
  async checkHealth() {
    devLogger.repo('ApiRepository', 'checkHealth');
    
    // GET /api/health returns { status: "ok" }
    return httpClient.get('/api/health');
  }
};
