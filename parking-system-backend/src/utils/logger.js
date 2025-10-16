// src/utils/logger.js
import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// 🎨 Formato para consola (con colores y legible)
const consoleFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let log = `[${timestamp}] ${level}: ${message}`;
  
  // Si hay metadata adicional (como req, user, etc)
  if (Object.keys(metadata).length > 0) {
    log += `\n📋 Metadata: ${JSON.stringify(metadata, null, 2)}`;
  }
  
  // Si hay stack trace (errores)
  if (stack) {
    log += `\n🔴 Stack: ${stack}`;
  }
  
  return log;
});

// 📄 Formato para archivos (JSON estructurado para análisis)
const fileFormat = combine(
  errors({ stack: true }), // Captura stack traces
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  json() // Guarda en JSON para poder analizar después
);

// 🎯 Crear el logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", // Configurable por ambiente
  format: fileFormat,
  defaultMeta: { service: "parking-api" }, // Identifica tu servicio
  transports: [
    // 📁 Errores críticos (solo level: error)
    new winston.transports.File({ 
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5, // Mantiene 5 archivos rotados
    }),
    
    // 📁 Warnings (problemas no críticos)
    new winston.transports.File({ 
      filename: path.join(__dirname, "../../logs/warn.log"),
      level: "warn",
      maxsize: 5242880,
      maxFiles: 3,
    }),
    
    // 📁 Todo (info, warn, error)
    new winston.transports.File({ 
      filename: path.join(__dirname, "../../logs/combined.log"),
      maxsize: 10485760, // 10MB
      maxFiles: 7,
    }),
  ],
});

// 🖥️ En desarrollo, también mostrar en consola con colores
if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      consoleFormat
    ),
  }));
}

// 🔧 Métodos helper para logging específico
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