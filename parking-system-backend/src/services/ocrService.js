import fs from "fs";
import FormData from "form-data";
import { fastApiClient } from "../config/fastapi.js";
import vehicleRepo from "../repositories/vehicleRepository.js";
import rateRepo from "../repositories/rateRepository.js";
import parkingSessionRepo from "../repositories/parkingSessionRepository.js";

class OcrService {
  async processEntrance(image, adminId = 1) {
    if (!image) throw new Error("No se subió ninguna imagen.");

    const formData = new FormData();
    formData.append("file", fs.createReadStream(image.path));

    const response = await fastApiClient.post("/detect", formData, {
      headers: formData.getHeaders(),
    });

    const detected = response.data.plates?.[0];
    if (!detected) throw new Error("No se detectó ninguna placa.");

    const rawPlate = detected.plate.replace(/\s+/g, "");
    const plateNumber = rawPlate.substring(0, 6);
    const placePlate = rawPlate.substring(6) || null;
    const confidence = detected.confidence;

    // 1️⃣ Crear o buscar vehículo
    let vehicle = await vehicleRepo.findByPlate(plateNumber);
    if (!vehicle) {
      vehicle = await vehicleRepo.create({
        plate: plateNumber,
        place_plate: placePlate,
        admins_id: adminId,
        is_exempt: false,
      });
    }

    // 2️⃣ Verificar si ya tiene sesión activa
    const activeSession = await parkingSessionRepo.findActiveByPlate(plateNumber);
    if (activeSession) {
      return { message: "El vehículo ya tiene una sesión activa", plate: plateNumber };
    }

    // 3️⃣ Obtener tarifa activa
    const rate = await rateRepo.findActiveRateByAdmin(adminId);
    if (!rate) throw new Error("No hay tarifas activas para este administrador.");

    // 4️⃣ Crear nueva sesión de parqueo
    const session = await parkingSessionRepo.create({
      vehicle_plate: plateNumber,
      rate_id: rate.id_rates,
      active: 1,
    });

    return {
      message: "Entrada registrada exitosamente",
      plate: plateNumber,
      place_plate: placePlate,
      confidence,
      session_id: session.id_parking,
    };
  }

async processExit(image, adminId = 1) {
  if (!image) throw new Error("No se subió ninguna imagen.");

  const formData = new FormData();
  formData.append("file", fs.createReadStream(image.path));

  const response = await fastApiClient.post("/detect", formData, {
    headers: formData.getHeaders(),
  });

  const detected = response.data.plates?.[0];
  if (!detected) throw new Error("No se detectó ninguna placa.");

  const rawPlate = detected.plate.replace(/\s+/g, "");
  const plateNumber = rawPlate.substring(0, 6);
  const placePlate = rawPlate.substring(6) || null;
  const confidence = detected.confidence;

  // 1️⃣ Buscar sesión activa del vehículo
  const activeSession = await parkingSessionRepo.findActiveByPlate(plateNumber);

  // 2️⃣ Si no hay sesión activa → salida permitida
  if (!activeSession) {
    return {
      allowed: true,
      plate: plateNumber,
      place_plate: placePlate,
      confidence,
      message: "Salida permitida, no hay sesión activa",
    };
  }

  // 3️⃣ Si hay sesión activa y no ha pagado → bloquear salida
  if (!activeSession.is_paid) {
    return {
      allowed: false,
      plate: plateNumber,
      place_plate: placePlate,
      confidence,
      message: "Pago pendiente, no se permite salida",
      session_id: activeSession.id_parking,
    };
  }

  // 4️⃣ Si ya pagó → salida permitida (la sesión ya debería estar cerrada)
  return {
    allowed: true,
    plate: plateNumber,
    place_plate: placePlate,
    confidence,
    message: "Salida permitida, pago confirmado",
    session_id: activeSession.id_parking,
  };
}
}


export default new OcrService();
