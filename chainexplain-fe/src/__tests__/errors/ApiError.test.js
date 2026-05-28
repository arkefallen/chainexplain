import { describe, it, expect } from 'vitest';
import { ApiError } from '../../errors/ApiError';

describe('ApiError Custom Class', () => {
  describe('Constructor initialization', () => {
    it('should set all properties correctly', () => {
      const originalErr = new Error('Original');
      const apiErr = new ApiError('Test Message', 404, {
        isNetworkError: true,
        isTimeout: false,
        originalError: originalErr
      });

      expect(apiErr.message).toBe('Test Message');
      expect(apiErr.statusCode).toBe(404);
      expect(apiErr.isNetworkError).toBe(true);
      expect(apiErr.isTimeout).toBe(false);
      expect(apiErr.originalError).toBe(originalErr);
      expect(apiErr.name).toBe('ApiError');
    });
  });

  describe('fromAxiosError mapping', () => {
    it('should map response error (4xx/5xx) from server', () => {
      const mockAxiosError = {
        response: {
          status: 500,
          data: {
            message: 'Database query failed'
          }
        }
      };

      const result = ApiError.fromAxiosError(mockAxiosError);

      expect(result.message).toBe('Database query failed');
      expect(result.statusCode).toBe(500);
      expect(result.isNetworkError).toBe(false);
      expect(result.isTimeout).toBe(false);
      expect(result.originalError).toBe(mockAxiosError);
    });

    it('should use alternative error/status message if message is missing', () => {
      const mockAxiosError = {
        response: {
          status: 400,
          data: {
            error: 'Bad request payload'
          }
        }
      };

      const result = ApiError.fromAxiosError(mockAxiosError);
      expect(result.message).toBe('Bad request payload');
      expect(result.statusCode).toBe(400);
    });

    it('should map connection timeout errors', () => {
      const mockAxiosError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
        request: {}
      };

      const result = ApiError.fromAxiosError(mockAxiosError);

      expect(result.message).toContain('Connection timed out');
      expect(result.statusCode).toBeNull();
      expect(result.isNetworkError).toBe(false);
      expect(result.isTimeout).toBe(true);
    });

    it('should map client network offline errors', () => {
      const mockAxiosError = {
        message: 'Network Error',
        request: {}
      };

      const result = ApiError.fromAxiosError(mockAxiosError);

      expect(result.message).toContain('Network error');
      expect(result.statusCode).toBeNull();
      expect(result.isNetworkError).toBe(true);
      expect(result.isTimeout).toBe(false);
    });

    it('should fallback gracefully for undefined inputs', () => {
      const result = ApiError.fromAxiosError(null);
      expect(result.message).toBe('Unknown error occurred');
    });
  });

  describe('fromFirestoreError mapping', () => {
    it('should map permission-denied code', () => {
      const mockDbError = {
        code: 'permission-denied',
        message: 'Missing or insufficient permissions.'
      };

      const result = ApiError.fromFirestoreError(mockDbError);

      expect(result.message).toContain('Access denied');
      expect(result.statusCode).toBe('permission-denied');
      expect(result.isNetworkError).toBe(false);
    });

    it('should map not-found code', () => {
      const mockDbError = {
        code: 'not-found',
        message: 'Document reference missing.'
      };

      const result = ApiError.fromFirestoreError(mockDbError);

      expect(result.message).toContain('not found');
      expect(result.statusCode).toBe('not-found');
    });

    it('should map unavailable code as network error', () => {
      const mockDbError = {
        code: 'unavailable',
        message: 'Service is temporarily offline.'
      };

      const result = ApiError.fromFirestoreError(mockDbError);

      expect(result.message).toContain('offline or unavailable');
      expect(result.statusCode).toBe('unavailable');
      expect(result.isNetworkError).toBe(true);
    });

    it('should fallback gracefully for other custom codes', () => {
      const mockDbError = {
        code: 'resource-exhausted',
        message: 'Quota exceeded'
      };

      const result = ApiError.fromFirestoreError(mockDbError);
      expect(result.message).toContain('resource-exhausted');
      expect(result.statusCode).toBe('resource-exhausted');
    });
  });
});
