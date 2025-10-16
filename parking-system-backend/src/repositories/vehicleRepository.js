import pool from "../config/database.js";
import Vehicle from "../models/vehicleModel.js";

class VehicleRepository {
  async create(vehicle) {
    const [result] = await pool.query(
      `INSERT INTO vehicles (plate, place_plate, is_exempt, admins_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE updated_at = NOW()`,
      [vehicle.plate, vehicle.place_plate, vehicle.is_exempt, vehicle.admins_id]
    );
    return { ...vehicle, id: result.insertId };
  }

  async findByPlate(plate) {
    const [rows] = await pool.query(`SELECT * FROM vehicles WHERE plate = ?`, [plate]);
    if (rows.length === 0) return null;
    return new Vehicle(rows[0]);
  }

  async findAll() {
    const [rows] = await pool.query(`SELECT * FROM vehicles`);
    return rows.map((row) => new Vehicle(row));
  }

  async update(vehicle) {
    await pool.query(
      `UPDATE vehicles SET place_plate=?, is_exempt=?, updated_at=NOW() WHERE plate=?`,
      [vehicle.place_plate, vehicle.is_exempt, vehicle.plate]
    );
    return vehicle;
  }

  async delete(plate) {
    await pool.query(`DELETE FROM vehicles WHERE plate=?`, [plate]);
  }
}

export default new VehicleRepository();
