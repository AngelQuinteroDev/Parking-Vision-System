import  ParkingSessionRepository  from "../repositories/parkingSessionRepository.js";
import PaymentRepository  from "../repositories/paymentRepository.js";
import logger from "../utils/logger.js";

class ParkingController {
  // Registrar pago y cerrar sesión
  async registerPayment(req, res, next) {
    try {
      const { plate, amount, method, transaction_ref } = req.body;

      if (!plate || !amount || !method) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }

      const session = await ParkingSessionRepository.findActiveByPlate(plate);
      if (!session) {
        return res.status(404).json({ message: "No hay sesión activa para esta placa" });
      }

      await PaymentRepository.registerPayment({
        vehicle_plate: plate,
        amount,
        payment_method: method,
        payment_status: "COMPLETED",
        transaction_ref: transaction_ref || null,
      });

      // ✅ parámetros correctos y en orden
      const exit_time = new Date();
      const total_time_minutes = 60;
      const total_price = amount;

      await ParkingSessionRepository.closeSession(
        session.id_parking,
        exit_time,
        total_time_minutes,
        total_price
      );

      logger.info(`💳 Pago completado para ${plate}`);
      res.json({ message: "Pago registrado y sesión cerrada correctamente" });
    } catch (error) {
      logger.error(`❌ Error en registerPayment: ${error.message}`);
      next(error);
    }
  }
}

export default new ParkingController();
