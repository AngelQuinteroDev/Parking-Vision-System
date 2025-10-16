import pool from "../config/database.js";

export const VehicleRepository = {
  async create(vehicle) {
    const { plate, place_plate, admins_id } = vehicle;
    const [result] = await pool.query(
      `INSERT INTO vehicles (plate, place_plate, admins_id)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE updated_at = NOW()`,
      [plate, place_plate, admins_id]
    );
    return result;
  },

  async findByPlate(plate) {
    const [rows] = await pool.query(`SELECT * FROM vehicles WHERE plate = ?`, [plate]);
    return rows[0] || null;
  }
};
