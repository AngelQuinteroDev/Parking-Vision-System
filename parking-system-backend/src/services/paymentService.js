import paymentRepo from "../repositories/paymentRepository.js";
import parkingSessionRepo from "../repositories/parkingSessionRepository.js";

class PaymentService {
  async processPayment(plate, paymentData) {
    const session = await parkingSessionRepo.findActiveByPlate(plate);
    if (!session) throw new Error("There is no active session for this vehicle.");

    const now = new Date();
    const entry = new Date(session.entry_time);
    const totalMinutes = Math.ceil((now - entry) / 60000);

    const ratePerMin = session.price_per_minute;
    const total = Math.max(totalMinutes * ratePerMin, session.min_charge);

    // Register payment
    const payment = await paymentRepo.create({
      vehicle_plate: plate,
      amount: total,
      payment_method: paymentData.method || "cash",
      payment_status: "paid",
      transaction_ref: paymentData.transaction_ref || null,
    });

    // Update session
    await parkingSessionRepo.updatePayment(session.id_parking, {
      payment_id: payment.payment_id,
      is_paid: 1,
      total_time_minutes: totalMinutes,
      total_price: total,
    });

    return { message: "Payment successfully registered", total, payment };
  }
}

export default new PaymentService();
