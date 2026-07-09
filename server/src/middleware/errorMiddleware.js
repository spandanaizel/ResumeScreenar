const multer = require("multer");

// Handles unknown routes
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Centralized error handler
const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for field: ${field}`;
  }

  // Mongoose invalid ObjectId (CastError)
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Multer errors
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Resume file must be smaller than 5MB";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = err.message || "Only PDF files are allowed";
    } else {
      message = err.message || "File upload error";
    }
  }

  // JWT errors (fallback, authMiddleware usually catches these itself)
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Not authorized, invalid or expired token";
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
