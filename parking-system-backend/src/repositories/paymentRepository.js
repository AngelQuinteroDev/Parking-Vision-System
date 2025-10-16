import pool from "../config/database.js";
import Payment from "../models/paymentModel.js";

class PaymentRepository {
  async registerPayment(payment) {
    const [result] = await pool.query(
      `INSERT INTO payments 
        (vehicle_plate, amount, payment_method, payment_status, transaction_ref, payment_date)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        payment.vehicle_plate,
        payment.amount,
        payment.payment_method,
        payment.payment_status,
        payment.transaction_ref,
      ]
    );
    return { ...payment, payment_id: result.insertId };
  }

  async findById(id) {
    const [rows] = await pool.query(`SELECT * FROM payments WHERE payment_id = ?`, [id]);
    if (rows.length === 0) return null;
    return new Payment(rows[0]);
  }

  async findByVehiclePlate(plate) {
    const [rows] = await pool.query(`SELECT * FROM payments WHERE vehicle_plate = ?`, [plate]);
    return rows.map((row) => new Payment(row));
  }


  async hasPaid(vehicle_plate) {
    const [rows] = await pool.query(
      `SELECT * FROM payments WHERE vehicle_plate = ? AND payment_status = 'PAID' ORDER BY payment_date DESC LIMIT 1`,
      [vehicle_plate]
    );
    return !!rows[0];
  }

  async updateStatus(payment_id, status) {
    await pool.query(
      `UPDATE payments SET payment_status=?, payment_date=NOW() WHERE payment_id=?`,
      [status, payment_id]
    );
  }
}

export default new PaymentRepository();
