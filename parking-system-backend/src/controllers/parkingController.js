import ParkingSessionRepository from "../repositories/parkingSessionRepository.js";
import PaymentRepository from "../repositories/paymentRepository.js";
import logger from "../utils/logger.js";
import { createError } from "../middleware/errorHandler.js";

class ParkingController {
  async registerPayment(req, res, next) {
    try {
      const { plate, method, transaction_ref } = req.body;

      // Validate
      if (!plate || !method) {
        throw createError("Required fields are missing: plate y method", 400);
      }

      logger.info("Starting payment registration", {
        plate,
        method,
        transaction_ref,
      });

      // Search active sessions
      const session = await ParkingSessionRepository.findActiveWithRate(plate);
      if (!session) {
        throw createError("There is no active session for this plate", 404);
      }

      logger.info("Active session found", {
        plate,
        sessionId: session.id_parking,
        entryTime: session.entry_time,
      });

      // Calculate time in minutes
      const entryTime = new Date(session.entry_time);
      const exitTime = new Date();
      let totalMinutes = Math.ceil((exitTime - entryTime) / 60000);

      // Apply grace minutes
      if (session.grace_minutes && totalMinutes <= session.grace_minutes) {
        logger.info("Apply grace minutes", {
          totalMinutes,
          graceMinutes: session.grace_minutes,
        });
        totalMinutes = 0;
      }

      // Calculate total price
      let totalPrice = totalMinutes * session.price_per_minute;
      if (session.min_charge && totalPrice < session.min_charge) {
        logger.info("Applying minimum charge", {
          calculatedPrice: totalPrice,
          minCharge: session.min_charge,
        });
        totalPrice = session.min_charge;
      }

      logger.info("Completed price calculation", {
        totalMinutes,
        pricePerMinute: session.price_per_minute,
        totalPrice,
      });

      // Register payment
      await PaymentRepository.registerPayment({
        vehicle_plate: plate,
        amount: totalPrice,
        payment_method: method,
        payment_status: "COMPLETED",
        transaction_ref: transaction_ref || null,
      });

      // Close Session
      await ParkingSessionRepository.closeSession(
        session.id_parking,
        exitTime,
        totalMinutes,
        totalPrice
      );

      logger.info("Payment completed successfully", {
        plate,
        sessionId: session.id_parking,
        totalPrice,
        totalMinutes,
        method,
      });

      res.json({
        message: "Payment recorded and session closed successfully",
        details: {
          plate,
          totalMinutes,
          totalPrice,
          paymentMethod: method,
        },
      });

    } catch (error) {
      logger.error("Error registering payment", {
        error: error.message,
        plate: req.body.plate,
        method: req.body.method,
      });
      next(error);
    }
  }
}

export default new ParkingController();