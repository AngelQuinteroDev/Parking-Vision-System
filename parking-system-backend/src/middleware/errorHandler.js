// src/middlewares/errorHandler.js
import logger from "../utils/logger.js";

// Custom application error class
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    Error.captureStackTrace(this, this.constructor);
  }
}

// Database error handling
function handleDatabaseError(err) {
  // SQL syntax error
  if (err.code === "ER_PARSE_ERROR" || err.sqlMessage) {
    logger.error("SQL Error", {
      code: err.code,
      sqlMessage: err.sqlMessage,
      sql: err.sql,
    });
    return new AppError("Database query error", 500);
  }

  // Duplicate key
  if (err.code === "ER_DUP_ENTRY") {
    return new AppError("A record with these details already exists", 409);
  }

  // Foreign key constraint
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return new AppError("Invalid database reference", 400);
  }

  return err;
}

// Validation error handling
function handleValidationError(err) {
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el) => el.message);
    return new AppError(`Invalid data: ${errors.join(", ")}`, 400);
  }
  return err;
}

// Main error handling middleware
export function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log the error with full context
  logger.logError(err, req);

  // Identify and transform specific error types
  error = handleDatabaseError(error);
  error = handleValidationError(error);

  // Determine status code
  const statusCode = error.statusCode || err.status || 500;
  const status = error.status || "error";

  // Development response (with stack trace)
  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      status,
      message: error.message,
      error: err,
      stack: err.stack,
      request: {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
      },
    });
  }

  // Production response (no sensitive info)
  // Operational errors (expected and handled)
  if (error.isOperational) {
    return res.status(statusCode).json({
      status,
      message: error.message,
    });
  }

  // Programming or unknown errors
  logger.error("UNHANDLED CRITICAL ERROR", {
    error: err,
    stack: err.stack,
  });

  return res.status(500).json({
    status: "error",
    message: "Something went wrong. Please try again later.",
  });
}

// Middleware for 404 routes
export function notFoundHandler(req, res, next) {
  const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(error);
}

// Helper to quickly create errors
export const createError = (message, statusCode = 500) => {
  return new AppError(message, statusCode);
};
