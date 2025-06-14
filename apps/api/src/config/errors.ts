export const ERROR_CODES = {
  // Authentication
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_AUTH_FORMAT: 'INVALID_AUTH_FORMAT',
  INVALID_API_KEY: 'INVALID_API_KEY',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation
  INVALID_REQUEST_DATA: 'INVALID_REQUEST_DATA',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resources
  PROMPT_NOT_FOUND: 'PROMPT_NOT_FOUND',
  WORKSPACE_NOT_FOUND: 'WORKSPACE_NOT_FOUND',
  TAG_NOT_FOUND: 'TAG_NOT_FOUND',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const createErrorResponse = (
  code: ErrorCode,
  message: string,
  details?: unknown
): ApiError & { requestId?: string } => {
  const error: ApiError & { requestId?: string } = {
    code,
    message,
    details,
  };
  
  // Extract requestId from details if present
  if (details && typeof details === 'object' && 'requestId' in details) {
    error.requestId = (details as Record<string, unknown>).requestId as string;
  }
  
  return error;
};