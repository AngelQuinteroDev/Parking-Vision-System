import pool from "../config/database.js";
import Rate from "../models/rateModel.js";

class RateRepository {
  async create(rate) {
    const [result] = await pool.query(
      `INSERT INTO rates (name, price_per_minute, min_charge, grace_minutes, active, created_at, updated_at, admins_id)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
      [
        rate.name,
        rate.price_per_minute,
        rate.min_charge,
        rate.grace_minutes,
        rate.active,
        rate.admins_id,
      ]
    );
    return { ...rate, id_rates: result.insertId };
  }

  async findActiveRateByAdmin(adminId) {
    const [rows] = await pool.query(
      `SELECT * FROM rates WHERE admins_id = ? AND active = 1 LIMIT 1`,
      [adminId]
    );
    if (rows.length === 0) return null;
    return new Rate(rows[0]);
  }

  async findAll() {
    const [rows] = await pool.query(`SELECT * FROM rates`);
    return rows.map((row) => new Rate(row));
  }

  async update(rate) {
    await pool.query(
      `UPDATE rates SET name=?, price_per_minute=?, min_charge=?, grace_minutes=?, active=?, updated_at=NOW() WHERE id_rates=?`,
      [
        rate.name,
        rate.price_per_minute,
        rate.min_charge,
        rate.grace_minutes,
        rate.active,
        rate.id_rates,
      ]
    );
    return rate;
  }
}

export default new RateRepository();
