// src/middlewares/errorHandler.js
import logger from "../utils/logger.js";

export function errorHandler(err, req, res, next) {
  // Log detallado del error
  logger.error(`${err.message} - ${req.method} ${req.originalUrl}`);

  // Si el error tiene un status definido (por ejemplo, 404 o 400)
  const status = err.status || 500;

  res.status(status).json({
    status: "error",
    message: err.message || "Error interno del servidor",
  });
}
