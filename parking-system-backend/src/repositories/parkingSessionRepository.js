import pool from "../config/database.js";
import ParkingSession from "../models/parkingSessionModel.js";

class ParkingSessionRepository {
  async create(session) {
    const [result] = await pool.query(
      `INSERT INTO parking_sessions 
        (vehicle_plate, rate_id, payment_id, entry_time, exit_time, total_time_minutes, total_price, is_paid, active)
       VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?)`,
      [
        session.vehicle_plate,
        session.rate_id,
        session.payment_id,
        session.exit_time,
        session.total_time_minutes,
        session.total_price,
        session.is_paid,
        session.active,
      ]
    );
    return { ...session, id_parking: result.insertId };
  }

  async findActiveByPlate(plate) {
    const [rows] = await pool.query(
      `SELECT * FROM parking_sessions WHERE vehicle_plate = ? AND active = 1 LIMIT 1`,
      [plate]
    );
    if (rows.length === 0) return null;
    return new ParkingSession(rows[0]);
  }

  async closeSession(id_parking, exit_time, total_time_minutes, total_price) {
    await pool.query(
      `UPDATE parking_sessions 
       SET exit_time=?, total_time_minutes=?, total_price=?, is_paid=1, active=0 
       WHERE id_parking=?`,
      [exit_time, total_time_minutes, total_price, id_parking]
    );
  }

  async findAllActive() {
    const [rows] = await pool.query(`SELECT * FROM parking_sessions WHERE active = 1`);
    return rows.map((row) => new ParkingSession(row));
  }

  async updatePaymentStatus(id_parking, is_paid) {
    await pool.query(
      `UPDATE parking_sessions SET is_paid=?, updated_at=NOW() WHERE id_parking=?`,
      [is_paid, id_parking]
    );
  }


  async findActiveWithRate(plate) {
  const [rows] = await pool.query(
    `SELECT ps.*, r.price_per_minute, r.min_charge, r.grace_minutes
     FROM parking_sessions ps
     JOIN rates r ON ps.rate_id = r.id_rates
     WHERE ps.vehicle_plate = ? AND ps.active = 1
     LIMIT 1`,
    [plate]
  );
  if (rows.length === 0) return null;
  return rows[0];
}
}

export default new ParkingSessionRepository();
