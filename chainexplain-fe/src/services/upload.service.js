import { apiRepository } from '../repositories/api.repository';
import { jobDto } from '../dto/job.dto';
import { ApiError } from '../errors/ApiError';
import { devLogger } from '../utils/devLogger';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

/**
 * Service to orchestrate file upload operations, client-side validation,
 * and mapping backend responses.
 */
export const uploadService = {
  /**
   * Uploads a cryptocurrency whitepaper after performing strict client-side validation.
   * 
   * @param {File} file - PDF file to be uploaded
   * @returns {Promise<Object>} Normalized upload result: { jobId, status, fileName }
   * @throws {ApiError} If validation fails or network request encounters an error
   */
  async uploadWhitepaper(file) {
    devLogger.service('UploadService', 'uploadWhitepaper', { name: file?.name, size: file?.size });

    // 1. Client-Side Validation
    if (!file) {
      devLogger.info('❌ Upload rejected: No file provided');
      throw new ApiError('Please select a file to upload.', null);
    }

    // Type validation: Must be a PDF
    const isPdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      devLogger.info(`❌ Upload rejected: Invalid file type (${file.type || 'unknown'})`);
      throw new ApiError('Only PDF documents are supported. Please choose a valid PDF file.', null);
    }

    // Size validation: Must be <= 10MB
    if (file.size > MAX_FILE_SIZE) {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
      devLogger.info(`❌ Upload rejected: File size is too large (${sizeInMb}MB)`);
      throw new ApiError(`File is too large (${sizeInMb}MB). Maximum file size allowed is 10MB.`, null);
    }

    devLogger.info('✅ Client validation passed. Proceeding with API upload...');

    try {
      // 2. Repository Network Call
      const rawResponse = await apiRepository.uploadPdf(file);
      
      // 3. DTO Data Mapping
      const mappedResult = jobDto.mapUploadResponse(rawResponse);
      
      devLogger.info('✅ API upload success, mapped jobId:', mappedResult.jobId);
      return mappedResult;
    } catch (err) {
      // Propagation of normalized ApiError from repository
      devLogger.info('❌ Service-level upload failed:', err.message);
      throw err;
    }
  }
};
