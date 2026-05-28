/**
 * Custom error class to handle API and Firestore errors in a unified format.
 * Helps normalize error properties (message, status, network status, timeout)
 * across the application layer.
 */
export class ApiError extends Error {
  /**
   * @param {string} message - User-friendly error message
   * @param {number|string|null} statusCode - HTTP status code or database error code
   * @param {Object} [options={}] - Additional details
   * @param {boolean} [options.isNetworkError=false] - True if internet connection failed
   * @param {boolean} [options.isTimeout=false] - True if request timed out
   * @param {Error|null} [options.originalError=null] - The original underlying error object
   */
  constructor(message, statusCode = null, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isNetworkError = options.isNetworkError || false;
    this.isTimeout = options.isTimeout || false;
    this.originalError = options.originalError || null;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Factory method to create an ApiError from an Axios error object
   * @param {Object} error - Axios error object
   * @returns {ApiError} Normalized ApiError
   */
  static fromAxiosError(error) {
    if (!error) return new ApiError('Unknown error occurred');

    if (error.response) {
      // Server responded with an error status (4xx, 5xx)
      const data = error.response.data;
      const message = data?.message || data?.error || `Server responded with status ${error.response.status}`;
      return new ApiError(message, error.response.status, { originalError: error });
    } else if (error.request) {
      // Request was sent but no response was received (network or timeout)
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout');
      const message = isTimeout 
        ? 'Connection timed out. Please check if backend is running.'
        : 'Network error. Please check your internet connection.';
      return new ApiError(message, null, {
        isNetworkError: !isTimeout,
        isTimeout,
        originalError: error
      });
    } else {
      // Something went wrong setting up the request
      return new ApiError(error.message || 'Error initializing connection request', null, { originalError: error });
    }
  }

  /**
   * Factory method to create an ApiError from a Firestore error object
   * @param {Object} error - Firestore SDK error object
   * @returns {ApiError} Normalized ApiError
   */
  static fromFirestoreError(error) {
    if (!error) return new ApiError('Unknown database error occurred');

    let message = error.message || 'Database connection error';
    let statusCode = error.code || null;

    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          message = 'Access denied. You do not have permission to access this document.';
          break;
        case 'not-found':
          message = 'The requested job process details were not found.';
          break;
        case 'unavailable':
          message = 'Database is offline or unavailable. Check connection.';
          break;
        default:
          message = `Database error (${error.code}): ${error.message}`;
      }
    }

    return new ApiError(message, statusCode, {
      isNetworkError: error.code === 'unavailable',
      originalError: error
    });
  }
}
