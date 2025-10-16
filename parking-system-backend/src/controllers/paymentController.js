import paymentService from "../services/paymentService.js";
import logger from "../utils/logger.js";
import { createError } from "../middleware/errorHandler.js";

class PaymentController {
  async pay(req, res, next) {
    try {
      const { plate } = req.params;

      // Validación
      if (!plate) {
        throw createError("Placa no proporcionada", 400);
      }

      logger.info("💳 Procesando pago", {
        plate,
        paymentData: req.body,
      });

      const result = await paymentService.processPayment(plate, req.body);

      logger.info("✅ Pago procesado exitosamente", {
        plate,
        result,
      });

      res.json(result);

    } catch (error) {
      logger.error("❌ Error al procesar pago", {
        error: error.message,
        plate: req.params.plate,
        body: req.body,
      });
      next(error);
    }
  }
}

export default new PaymentController();