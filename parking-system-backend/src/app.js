import express from "express";
import dotenv from "dotenv";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import ocrRoutes from "./routes/ocrRoutes.js";
import parkingRoutes from "./routes/parkingRoutes.js"; // ← agrega esto
import logger from "./utils/logger.js";

dotenv.config();
const app = express();

// Log de cada petición
app.use((req, res, next) => {
  logger.logRequest(req);
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/ocr", ocrRoutes);
app.use("/api/parking", parkingRoutes);

// Middleware de manejo de errores (siempre al final)
app.use(errorHandler);
app.use(notFoundHandler);

export default app;