// Centralized error handling utilities

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleSupabaseError = (error: any): AppError => {
  if (error?.code === 'PGRST116') {
    return new AppError('No data found', 'NOT_FOUND', 404);
  }
  
  if (error?.code === '23505') {
    return new AppError('This record already exists', 'DUPLICATE', 409);
  }
  
  if (error?.message?.includes('JWT expired')) {
    return new AppError('Your session has expired. Please sign in again.', 'SESSION_EXPIRED', 401);
  }
  
  if (error?.message?.includes('Invalid login credentials')) {
    return new AppError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }
  
  return new AppError(
    error?.message || 'An unexpected error occurred',
    error?.code || 'UNKNOWN_ERROR',
    error?.statusCode || 500
  );
};

export const logError = (error: Error, context?: string) => {
  console.error(`[${context || 'App'}] Error:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
};

export const showUserFriendlyError = (error: Error) => {
  if (error instanceof AppError) {
    alert(error.message);
  } else {
    alert('Something went wrong. Please try again.');
  }
};