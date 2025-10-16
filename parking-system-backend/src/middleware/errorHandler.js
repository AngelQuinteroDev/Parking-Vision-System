// src/middlewares/errorHandler.js
import logger from "../utils/logger.js";

// 🎯 Clase personalizada para errores de la aplicación
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    Error.captureStackTrace(this, this.constructor);
  }
}

// 🔴 Manejo de errores de base de datos
function handleDatabaseError(err) {
  // Error de sintaxis SQL
  if (err.code === "ER_PARSE_ERROR" || err.sqlMessage) {
    logger.error("🔴 SQL Error", {
      code: err.code,
      sqlMessage: err.sqlMessage,
      sql: err.sql,
    });
    return new AppError("Error en la consulta a la base de datos", 500);
  }

  // Clave duplicada
  if (err.code === "ER_DUP_ENTRY") {
    return new AppError("Ya existe un registro con esos datos", 409);
  }

  // Foreign key constraint
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return new AppError("Referencia inválida en la base de datos", 400);
  }

  return err;
}

// 🔴 Manejo de errores de validación
function handleValidationError(err) {
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el) => el.message);
    return new AppError(`Datos inválidos: ${errors.join(", ")}`, 400);
  }
  return err;
}

// 🛡️ Middleware principal de manejo de errores
export function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log del error con contexto completo
  logger.logError(err, req);

  // 🔍 Identificar y transformar tipos específicos de errores
  error = handleDatabaseError(error);
  error = handleValidationError(error);

  // 📊 Determinar código de estado
  const statusCode = error.statusCode || err.status || 500;
  const status = error.status || "error";

  // 🚨 Respuesta en desarrollo (con stack trace)
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

  // 🔒 Respuesta en producción (sin información sensible)
  // Errores operacionales (esperados y controlados)
  if (error.isOperational) {
    return res.status(statusCode).json({
      status,
      message: error.message,
    });
  }

  // Errores de programación o desconocidos
  logger.error("💥 ERROR CRÍTICO NO CONTROLADO", {
    error: err,
    stack: err.stack,
  });

  return res.status(500).json({
    status: "error",
    message: "Algo salió mal. Por favor intenta de nuevo más tarde.",
  });
}

// 🔍 Middleware para rutas no encontradas (404)
export function notFoundHandler(req, res, next) {
  const error = new AppError(`No se encontró la ruta ${req.originalUrl}`, 404);
  next(error);
}

// 🎯 Helper para crear errores rápidamente
export const createError = (message, statusCode = 500) => {
  return new AppError(message, statusCode);
};