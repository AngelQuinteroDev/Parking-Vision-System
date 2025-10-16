import paymentService from "../services/paymentService.js";
import logger from "../utils/logger.js";
import { createError } from "../middleware/errorHandler.js";

class PaymentController {
  async pay(req, res, next) {
    try {
      const { plate } = req.params;

      // Validation
      if (!plate) {
        throw createError("License plate not provided", 400);
      }

      logger.info("Processing payment", {
        plate,
        paymentData: req.body,
      });

      const result = await paymentService.processPayment(plate, req.body);

      logger.info("Payment processed successfully", {
        plate,
        result,
      });

      res.json(result);

    } catch (error) {
      logger.error("Error processing payment", {
        error: error.message,
        plate: req.params.plate,
        body: req.body,
      });
      next(error);
    }
  }
}

export default new PaymentController();
