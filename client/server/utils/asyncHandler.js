/**
 * Higher-order function to wrap asynchronous express routes and forward errors to the global error handler.
 * @param {Function} fn - Asynchronous Express route handler or middleware
 * @returns {Function} Express route handler with error catching
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
