import ocrService from "../services/ocrService.js";
import logger from "../utils/logger.js";
import { createError } from "../middleware/errorHandler.js";
import fs from "fs";

class OcrController {
  async detectEntrance(req, res, next) {
    try {
      // Validación
      if (!req.file) {
        throw createError("No image uploaded", 400);
      }

      logger.info("Processing vehicle entry", {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      });

      const result = await ocrService.processEntrance(req.file, 1);

      logger.info("Entry registered successfully", {
        plate: result.plate,
        sessionId: result.session_id,
        confidence: result.confidence,
      });

      res.status(200).json(result);

    } catch (error) {
      logger.error("Error processing entrance", {
        error: error.message,
        fileName: req.file?.originalname,
      });
      next(error); // Delegate the error handler
    } finally {
      if (req.file?.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) logger.warn("Could not delete temporary file", { path: req.file.path });
        });
      }
    }
  }

  async detectExit(req, res, next) {
    try {
      // Validate
      if (!req.file) {
        throw createError("No image uploaded", 400);
      }

      logger.info("Processing vehicle departure", {
        fileName: req.file.originalname,
      });

      const result = await ocrService.processExit(req.file, 1);

      // Log differentiated according to the result
      if (!result.allowed) {
        logger.warn("Exit blocked - Payment pending", {
          plate: result.plate,
          sessionId: result.session_id,
          confidence: result.confidence,
        });
      } else {
        logger.info("Exit allowed", {
          plate: result.plate,
          message: result.message,
        });
      }

      res.json(result);

    } catch (error) {
      logger.error("Error processing exit", {
        error: error.message,
        fileName: req.file?.originalname,
      });
      next(error);
    } finally {
      if (req.file?.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) logger.warn("Could not delete temporary file", { path: req.file.path });
        });
      }
    }
  }
}

export default new OcrController();
