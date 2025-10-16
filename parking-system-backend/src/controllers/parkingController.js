import  ParkingSessionRepository  from "../repositories/parkingSessionRepository.js";
import PaymentRepository  from "../repositories/paymentRepository.js";
import logger from "../utils/logger.js";

class ParkingController {
  // Registrar pago y cerrar sesión
  async registerPayment(req, res, next) {
    try {
      const { plate, method, transaction_ref } = req.body;

      if (!plate || !method) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }


      const session = await ParkingSessionRepository.findActiveWithRate(plate);
      if (!session) {
        return res.status(404).json({ message: "No hay sesión activa para esta placa" });
      }

      // 📌 Calcular tiempo en minutos
      const entryTime = new Date(session.entry_time);
      const exitTime = new Date();
      let totalMinutes = Math.ceil((exitTime - entryTime) / 60000); // diferencia en ms / 60000 = minutos
      
      // Aplicar minutos de gracia si aplica
      if (session.grace_minutes && totalMinutes <= session.grace_minutes) {
        totalMinutes = 0;
      }
      
      // 📌 Calcular total_price
      let totalPrice = totalMinutes * session.price_per_minute;
      if (session.min_charge && totalPrice < session.min_charge) {
        totalPrice = session.min_charge;
      }




      await PaymentRepository.registerPayment({
        vehicle_plate: plate,
        amount: totalPrice,
        payment_method: method,
        payment_status: "COMPLETED",
        transaction_ref: transaction_ref || null,
      });


      await ParkingSessionRepository.closeSession(
        session.id_parking,
        exitTime,        // exit_time
        totalMinutes,    // total_time_minutes
        totalPrice       // total_price
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
