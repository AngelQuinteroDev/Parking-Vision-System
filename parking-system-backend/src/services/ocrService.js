import fs from "fs";
import FormData from "form-data";
import { fastApiClient } from "../config/fastapi.js";
import vehicleRepo from "../repositories/vehicleRepository.js";
import rateRepo from "../repositories/rateRepository.js";
import parkingSessionRepo from "../repositories/parkingSessionRepository.js";

class OcrService {
  async processEntrance(image, adminId = 1) {
    if (!image) throw new Error("No image uploaded.");

    const formData = new FormData();
    formData.append("file", fs.createReadStream(image.path));

    const response = await fastApiClient.post("/detect", formData, {
      headers: formData.getHeaders(),
    });

    const detected = response.data.plates?.[0];
    if (!detected) throw new Error("No license plate was detected.");

    const rawPlate = detected.plate.replace(/\s+/g, "");
    const plateNumber = rawPlate.substring(0, 6);
    const placePlate = rawPlate.substring(6) || null;
    const confidence = detected.confidence;

    // Create or search for a vehicle
    let vehicle = await vehicleRepo.findByPlate(plateNumber);
    if (!vehicle) {
      vehicle = await vehicleRepo.create({
        plate: plateNumber,
        place_plate: placePlate,
        admins_id: adminId,
        is_exempt: false,
      });
    }

    // Check if you are already logged in
    const activeSession = await parkingSessionRepo.findActiveByPlate(plateNumber);
    if (activeSession) {
      return { message: "The vehicle already has an active session", plate: plateNumber };
    }

    // Get active rate
    const rate = await rateRepo.findActiveRateByAdmin(adminId);
    if (!rate) throw new Error("There are no active rates for this manager.");

    // Create a new parking session
    const session = await parkingSessionRepo.create({
      vehicle_plate: plateNumber,
      rate_id: rate.id_rates,
      active: 1,
    });

    return {
      message: "Entry successfully registered",
      plate: plateNumber,
      place_plate: placePlate,
      confidence,
      session_id: session.id_parking,
    };
  }

async processExit(image, adminId = 1) {
  if (!image) throw new Error("No image uploaded.");

  const formData = new FormData();
  formData.append("file", fs.createReadStream(image.path));

  const response = await fastApiClient.post("/detect", formData, {
    headers: formData.getHeaders(),
  });

  const detected = response.data.plates?.[0];
  if (!detected) throw new Error("No license plate was detected.");

  const rawPlate = detected.plate.replace(/\s+/g, "");
  const plateNumber = rawPlate.substring(0, 6);
  const placePlate = rawPlate.substring(6) || null;
  const confidence = detected.confidence;

  // Find the vehicle's active session
  const activeSession = await parkingSessionRepo.findActiveByPlate(plateNumber);

  // If there is no active session → exit allowed
  if (!activeSession) {
    return {
      allowed: true,
      plate: plateNumber,
      place_plate: placePlate,
      confidence,
      message: "Exit allowed, no active session",
    };
  }

  //  If you have an active session and have not paid → block exit
  if (!activeSession.is_paid) {
    return {
      allowed: false,
      plate: plateNumber,
      place_plate: placePlate,
      confidence,
      message: "Payment pending, no exit allowed",
      session_id: activeSession.id_parking,
    };
  }

  // If you have already paid → exit allowed (the session should already be closed)
  return {
    allowed: true,
    plate: plateNumber,
    place_plate: placePlate,
    confidence,
    message: "Exit allowed, payment confirmed",
    session_id: activeSession.id_parking,
  };
}
}


export default new OcrService();
