import { describe, it, expect, beforeEach } from 'vitest';

import { 
  AppErrorHandler, 
  ERROR_MESSAGES, 
  ERROR_CODES, 
  getErrorMessageFromStatus, 
  handleApiError,
  handleGenericError,
  handleValidationErrors 
} from '../error-handling';

describe('Error Handling', () => {
  describe('AppErrorHandler', () => {
    let handler: AppErrorHandler;

    beforeEach(() => {
      handler = new AppErrorHandler();
    });

    describe('Field Error Management', () => {
      it('should set and get field errors', () => {
        handler.setFieldError('email', 'Invalid email format');

        const error = handler.getFieldError('email');
        expect(error).toEqual({
          field: 'email',
          message: 'Invalid email format',
          code: undefined,
        });
      });

      it('should set field error with code', () => {
        handler.setFieldError('password', 'Password too weak', 'WEAK_PASSWORD');

        const error = handler.getFieldError('password');
        expect(error).toEqual({
          field: 'password',
          message: 'Password too weak',
          code: 'WEAK_PASSWORD',
        });
      });

      it('should return null for non-existent field error', () => {
        const error = handler.getFieldError('nonexistent');
        expect(error).toBeNull();
      });

      it('should get all field errors', () => {
        handler.setFieldError('email', 'Invalid email');
        handler.setFieldError('password', 'Password required');

        const errors = handler.getFieldErrors();
        expect(Object.keys(errors)).toHaveLength(2);
        expect(errors.email.message).toBe('Invalid email');
        expect(errors.password.message).toBe('Password required');
      });

      it('should clear specific field error', () => {
        handler.setFieldError('email', 'Invalid email');
        handler.setFieldError('password', 'Password required');

        handler.clearFieldError('email');

        expect(handler.getFieldError('email')).toBeNull();
        expect(handler.getFieldError('password')).not.toBeNull();
      });
    });

    describe('Global Error Management', () => {
      it('should set and get global error', () => {
        handler.setGlobalError('NETWORK_ERROR', 'Network connection failed');

        const error = handler.getGlobalError();
        expect(error).toMatchObject({
          code: 'NETWORK_ERROR',
          message: 'Network connection failed',
          details: undefined,
          timestamp: expect.any(String),
        });
      });

      it('should set global error with details', () => {
        const details = { status: 500, url: '/api/test' };
        handler.setGlobalError('SERVER_ERROR', 'Internal server error', details);

        const error = handler.getGlobalError();
        expect(error).toMatchObject({
          code: 'SERVER_ERROR',
          message: 'Internal server error',
          details,
          timestamp: expect.any(String),
        });
      });
    });

    describe('Error State Management', () => {
      it('should detect when errors exist', () => {
        expect(handler.hasErrors()).toBe(false);

        handler.setFieldError('email', 'Invalid email');
        expect(handler.hasErrors()).toBe(true);
        expect(handler.hasFieldErrors()).toBe(true);

        handler.clearAllErrors();
        expect(handler.hasErrors()).toBe(false);

        handler.setGlobalError('NETWORK_ERROR', 'Network failed');
        expect(handler.hasErrors()).toBe(true);
        expect(handler.hasFieldErrors()).toBe(false);
      });

      it('should clear all errors', () => {
        handler.setFieldError('email', 'Invalid email');
        handler.setGlobalError('NETWORK_ERROR', 'Network failed');

        expect(handler.hasErrors()).toBe(true);

        handler.clearAllErrors();

        expect(handler.hasErrors()).toBe(false);
        expect(handler.getFieldError('email')).toBeNull();
        expect(handler.getGlobalError()).toBeNull();
      });
    });
  });

  describe('Error Message Utilities', () => {
    describe('getErrorMessageFromStatus', () => {
      it('should return correct messages for HTTP status codes', () => {
        expect(getErrorMessageFromStatus(400)).toBe(ERROR_MESSAGES.VALIDATION_ERROR);
        expect(getErrorMessageFromStatus(401)).toBe(ERROR_MESSAGES.UNAUTHORIZED);
        expect(getErrorMessageFromStatus(403)).toBe(ERROR_MESSAGES.FORBIDDEN);
        expect(getErrorMessageFromStatus(404)).toBe(ERROR_MESSAGES.NOT_FOUND);
        expect(getErrorMessageFromStatus(500)).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
        expect(getErrorMessageFromStatus(502)).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
        expect(getErrorMessageFromStatus(503)).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
        expect(getErrorMessageFromStatus(504)).toBe(ERROR_MESSAGES.INTERNAL_ERROR);
      });

      it('should return rate limit message for 429', () => {
        expect(getErrorMessageFromStatus(429)).toBe('リクエストが多すぎます。しばらくしてから再試行してください');
      });

      it('should return network error for unknown status', () => {
        expect(getErrorMessageFromStatus(999)).toBe(ERROR_MESSAGES.NETWORK_ERROR);
      });
    });

    describe('handleApiError', () => {
      it('should handle API response with JSON error', async () => {
        const mockResponse = {
          status: 400,
          statusText: 'Bad Request',
          json: async () => ({ error: 'Invalid input', field: 'email' }),
        } as Response;

        const result = await handleApiError(mockResponse);

        expect(result).toMatchObject({
          code: 'HTTP_400',
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          details: { error: 'Invalid input', field: 'email' },
          timestamp: expect.any(String),
        });
      });

      it('should handle API response without JSON', async () => {
        const mockResponse = {
          status: 500,
          statusText: 'Internal Server Error',
          json: async () => { throw new Error('Not JSON'); },
        } as Response;

        const result = await handleApiError(mockResponse);

        expect(result).toMatchObject({
          code: 'HTTP_500',
          message: ERROR_MESSAGES.INTERNAL_ERROR,
          details: { status: 500, statusText: 'Internal Server Error' },
          timestamp: expect.any(String),
        });
      });
    });

    describe('handleGenericError', () => {
      it('should handle Error objects', () => {
        const error = new Error('Test error message');
        error.stack = 'Test stack trace';

        const result = handleGenericError(error);

        expect(result).toMatchObject({
          code: ERROR_CODES.INTERNAL_ERROR,
          message: 'Test error message',
          details: { stack: 'Test stack trace' },
          timestamp: expect.any(String),
        });
      });

      it('should handle non-Error objects', () => {
        const error = 'String error';

        const result = handleGenericError(error);

        expect(result).toMatchObject({
          code: ERROR_CODES.INTERNAL_ERROR,
          message: ERROR_MESSAGES.INTERNAL_ERROR,
          details: { originalError: 'String error' },
          timestamp: expect.any(String),
        });
      });
    });

    describe('handleValidationErrors', () => {
      it('should create error handler from validation errors', () => {
        const validationErrors = [
          { field: 'email', message: 'Invalid email format' },
          { field: 'password', message: 'Password too short', code: 'TOO_SHORT' },
        ];

        const handler = handleValidationErrors(validationErrors);

        expect(handler.getFieldError('email')).toEqual({
          field: 'email',
          message: 'Invalid email format',
          code: undefined,
        });

        expect(handler.getFieldError('password')).toEqual({
          field: 'password',
          message: 'Password too short',
          code: 'TOO_SHORT',
        });

        expect(handler.hasFieldErrors()).toBe(true);
      });
    });
  });

  describe('Error Constants', () => {
    it('should provide standard error messages', () => {
      expect(ERROR_MESSAGES.REQUIRED).toBe('この項目は必須です');
      expect(ERROR_MESSAGES.INVALID_EMAIL).toBe('メールアドレスの形式が正しくありません');
      expect(ERROR_MESSAGES.TOO_SHORT(5)).toBe('5文字以上で入力してください');
      expect(ERROR_MESSAGES.TOO_LONG(100)).toBe('100文字以下で入力してください');
    });

    it('should provide standard error codes', () => {
      expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ERROR_CODES.AUTHENTICATION_ERROR).toBe('AUTHENTICATION_ERROR');
      expect(ERROR_CODES.INTERNAL_ERROR).toBe('INTERNAL_ERROR');
    });
  });
});