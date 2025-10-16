import ParkingSessionRepository from "../repositories/parkingSessionRepository.js";
import PaymentRepository from "../repositories/paymentRepository.js";
import logger from "../utils/logger.js";
import { createError } from "../middleware/errorHandler.js";

class ParkingController {
  async registerPayment(req, res, next) {
    try {
      const { plate, method, transaction_ref } = req.body;

      // Validaciones
      if (!plate || !method) {
        throw createError("Faltan campos obligatorios: plate y method", 400);
      }

      logger.info("💳 Iniciando registro de pago", {
        plate,
        method,
        transaction_ref,
      });

      // Buscar sesión activa
      const session = await ParkingSessionRepository.findActiveWithRate(plate);
      if (!session) {
        throw createError("No hay sesión activa para esta placa", 404);
      }

      logger.info("📊 Sesión activa encontrada", {
        plate,
        sessionId: session.id_parking,
        entryTime: session.entry_time,
      });

      // Calcular tiempo en minutos
      const entryTime = new Date(session.entry_time);
      const exitTime = new Date();
      let totalMinutes = Math.ceil((exitTime - entryTime) / 60000);

      // Aplicar minutos de gracia
      if (session.grace_minutes && totalMinutes <= session.grace_minutes) {
        logger.info("🎁 Aplicando minutos de gracia", {
          totalMinutes,
          graceMinutes: session.grace_minutes,
        });
        totalMinutes = 0;
      }

      // Calcular precio total
      let totalPrice = totalMinutes * session.price_per_minute;
      if (session.min_charge && totalPrice < session.min_charge) {
        logger.info("💰 Aplicando cobro mínimo", {
          calculatedPrice: totalPrice,
          minCharge: session.min_charge,
        });
        totalPrice = session.min_charge;
      }

      logger.info("🧮 Cálculo de precio completado", {
        totalMinutes,
        pricePerMinute: session.price_per_minute,
        totalPrice,
      });

      // Registrar pago
      await PaymentRepository.registerPayment({
        vehicle_plate: plate,
        amount: totalPrice,
        payment_method: method,
        payment_status: "COMPLETED",
        transaction_ref: transaction_ref || null,
      });

      // Cerrar sesión
      await ParkingSessionRepository.closeSession(
        session.id_parking,
        exitTime,
        totalMinutes,
        totalPrice
      );

      logger.info("✅ Pago completado exitosamente", {
        plate,
        sessionId: session.id_parking,
        totalPrice,
        totalMinutes,
        method,
      });

      res.json({
        message: "Pago registrado y sesión cerrada correctamente",
        details: {
          plate,
          totalMinutes,
          totalPrice,
          paymentMethod: method,
        },
      });

    } catch (error) {
      logger.error("❌ Error al registrar pago", {
        error: error.message,
        plate: req.body.plate,
        method: req.body.method,
      });
      next(error);
    }
  }
}

export default new ParkingController();