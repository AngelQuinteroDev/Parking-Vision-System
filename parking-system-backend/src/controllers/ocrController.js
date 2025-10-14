import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import pool from "../config/database.js";

export const detectPlate = async (req, res) => {
  try {
    const image = req.file;
    if (!image) {
      console.log("❌ No se subió ninguna imagen");
      return res.status(400).json({ message: "No se subió ninguna imagen." });
    }
    console.log("📤 Imagen recibida:", image.originalname);

    // Enviar imagen a FastAPI
    const formData = new FormData();
    formData.append("file", fs.createReadStream(image.path));
    console.log("📤 Enviando imagen a FastAPI...");

    const response = await axios.post("http://127.0.0.1:8000/detect", formData, {
      headers: formData.getHeaders(),
    });

    console.log("📥 Respuesta de FastAPI:", response.data);

    const detected = response.data.plates?.[0];
    if (!detected) {
      console.log("❌ No se detectó ninguna placa en la respuesta de FastAPI");
      return res.status(400).json({ message: "No se detectó ninguna placa." });
    }

    // ---------------------------
    // Separar plate y place_plate
    // ---------------------------
    const rawPlate = detected.plate.replace(/\s+/g, "");
    const plateNumber = rawPlate.substring(0, 6); // primeros 6 caracteres
    const placePlate = rawPlate.substring(6) || null; // lo que sobra

    const confidence = detected.confidence;
    console.log("✅ Placa detectada:", plateNumber, "Lugar:", placePlate, "Confianza:", confidence);

    // ---------------------------
    // Insertar vehículo
    // ---------------------------
    const adminId = 1; // Asegúrate de que exista en la tabla admins
    await pool.query(
      "INSERT INTO vehicles (plate, place_plate, admins_id) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE updated_at = NOW()",
      [plateNumber, placePlate, adminId]
    );

    // ---------------------------
    // Obtener rate_id válido
    // ---------------------------
    const [rates] = await pool.query(
      "SELECT id_rates FROM rates WHERE active = 1 AND admins_id = ? LIMIT 1",
      [adminId]
    );
    if (!rates.length) {
      return res.status(500).json({ message: "No hay tarifas activas para este admin." });
    }
    const rateId = rates[0].id_rates;

    // ---------------------------
    // Insertar sesión de parqueo
    // ---------------------------
    await pool.query(
      "INSERT INTO parking_sessions (vehicle_plate, rate_id, entry_time, active) VALUES (?, ?, NOW(), 1)",
      [plateNumber, rateId]
    );

    // ---------------------------
    // Respuesta JSON para Postman
    // ---------------------------
    res.json({
      message: "Placa detectada y guardada correctamente",
      plate: plateNumber,
      place_plate: placePlate,
      confidence,
      rate_id: rateId,
      admin_id: adminId,
    });
  } catch (error) {
    console.error("❌ Error detectando placa:", error.response?.data || error.message);
    res.status(500).json({ message: "Error procesando la imagen." });
  } finally {
    // Eliminar archivo temporal
    if (req.file?.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("❌ Error eliminando archivo temporal:", err);
        else console.log("🗑️ Archivo temporal eliminado");
      });
    }
  }
};
