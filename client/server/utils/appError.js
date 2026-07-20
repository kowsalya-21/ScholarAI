/**
 * Custom Error class for operational (expected) errors.
 */
class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (e.g., 400, 404, 500)
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // Flag to distinguish operational (known user-facing errors) from programming bugs
    this.isOperational = true;

    // Capture stack trace, excluding the constructor call itself
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
