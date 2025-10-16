import ocrService from "../services/ocrService.js";
import logger from "../utils/logger.js";
import { createError } from "../middleware/errorHandler.js";
import fs from "fs";

class OcrController {
  async detectEntrance(req, res, next) {
    try {
      // Validación
      if (!req.file) {
        throw createError("No se subió ninguna imagen", 400);
      }

      logger.info("🚗 Procesando entrada de vehículo", {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      });

      const result = await ocrService.processEntrance(req.file, 1);

      logger.info("✅ Entrada registrada exitosamente", {
        plate: result.plate,
        sessionId: result.session_id,
        confidence: result.confidence,
      });

      res.status(200).json(result);

    } catch (error) {
      logger.error("❌ Error al procesar entrada", {
        error: error.message,
        fileName: req.file?.originalname,
      });
      next(error); // Delega al error handler
    } finally {
      if (req.file?.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) logger.warn("⚠️ No se pudo eliminar archivo temporal", { path: req.file.path });
        });
      }
    }
  }

  async detectExit(req, res, next) {
    try {
      // Validación
      if (!req.file) {
        throw createError("No se subió ninguna imagen", 400);
      }

      logger.info("🚪 Procesando salida de vehículo", {
        fileName: req.file.originalname,
      });

      const result = await ocrService.processExit(req.file, 1);

      // Log diferenciado según el resultado
      if (!result.allowed) {
        logger.warn("⛔ Salida bloqueada - Pago pendiente", {
          plate: result.plate,
          sessionId: result.session_id,
          confidence: result.confidence,
        });
      } else {
        logger.info("✅ Salida permitida", {
          plate: result.plate,
          message: result.message,
        });
      }

      res.json(result);

    } catch (error) {
      logger.error("❌ Error al procesar salida", {
        error: error.message,
        fileName: req.file?.originalname,
      });
      next(error);
    } finally {
      if (req.file?.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) logger.warn("⚠️ No se pudo eliminar archivo temporal", { path: req.file.path });
        });
      }
    }
  }
}

export default new OcrController();
