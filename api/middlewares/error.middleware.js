import ApiError from "../utils/ApiError.js";

const errorMiddleware = (err, req, res, next) => {
  // If it's our custom ApiError, use its values
  // Otherwise treat it as an unknown 500 error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    const validationErrors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationErrors,
    });
  }

  // Handle Mongoose duplicate key error (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      errors: [],
    });
  }

  // Handle invalid MongoDB ObjectId
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
      errors: [],
    });
  }

  // Default error response
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorMiddleware;