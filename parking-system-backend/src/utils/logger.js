// src/utils/logger.js
import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Console format 
const consoleFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let log = `[${timestamp}] ${level}: ${message}`;
  
  // If there is additional metadata (such as req, user, etc.)
  if (Object.keys(metadata).length > 0) {
    log += `\n📋 Metadata: ${JSON.stringify(metadata, null, 2)}`;
  }
  
  // If there is a stack trace (errors)
  if (stack) {
    log += `\n🔴 Stack: ${stack}`;
  }
  
  return log;
});

// File format (structured JSON for parsing)
const fileFormat = combine(
  errors({ stack: true }), // Capture stack traces
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  json() // save JSON
);

// create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", 
  format: fileFormat,
  defaultMeta: { service: "parking-api" }, // Identify yours servicio
  transports: [
    // Critical errors (level: error only)
    new winston.transports.File({ 
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5, // max files 
    }),
    
    //  Warnings 
    new winston.transports.File({ 
      filename: path.join(__dirname, "../../logs/warn.log"),
      level: "warn",
      maxsize: 5242880,
      maxFiles: 3,
    }),
    
    //  all
    new winston.transports.File({ 
      filename: path.join(__dirname, "../../logs/combined.log"),
      maxsize: 10485760, // 10MB
      maxFiles: 7,
    }),
  ],
});

// Consolo for production
if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      consoleFormat
    ),
  }));
}

//  Helper methods for specific logging
logger.logRequest = (req) => {
  logger.info("Incoming request", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
};

logger.logError = (error, req = null) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    code: error.code,
  };
  
  if (req) {
    errorLog.method = req.method;
    errorLog.url = req.originalUrl;
    errorLog.ip = req.ip;
    errorLog.body = req.body;
  }
  
  logger.error("Application error", errorLog);
};

export default logger;