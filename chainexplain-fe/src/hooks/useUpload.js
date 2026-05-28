import { useState } from 'react';
import { uploadService } from '../services/upload.service';
import useJobStore from '../store/useJobStore';
import { devLogger } from '../utils/devLogger';

/**
 * Facade hook for handling cryptocurrency whitepaper PDF upload flows.
 * Performs client-side validation, triggers store updates, and handles upload errors.
 */
export default function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  const startUpload = useJobStore((state) => state.startUpload);
  const setJobId = useJobStore((state) => state.setJobId);
  const setUploadedFile = useJobStore((state) => state.setUploadedFile);
  const setError = useJobStore((state) => state.setError);

  /**
   * Uploads a document file
   * @param {File} file - PDF file object
   */
  const uploadFile = async (file) => {
    if (!file) return;

    devLogger.hook('useUpload', 'uploadFileTriggered', { fileName: file.name });
    setIsUploading(true);
    setUploadError(null);
    startUpload();
    setUploadedFile(file);

    try {
      const result = await uploadService.uploadWhitepaper(file);
      devLogger.hook('useUpload', 'uploadFileSuccess', result);
      setJobId(result.jobId);
    } catch (err) {
      devLogger.hook('useUpload', 'uploadFileFailed', err.message);
      setUploadError(err.message);
      setError(err.message);
      throw err; // bubble error to UI submit handler
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    uploadError
  };
}
