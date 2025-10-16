import parkingSessionRepo from "../repositories/parkingSessionRepository.js";

class ParkingService {
  async processExit(plate) {
    const session = await parkingSessionRepo.findActiveByPlate(plate);
    if (!session) return { allowed: false, message: "No hay sesión activa" };

    if (!session.is_paid) {
      return { allowed: false, message: "El vehículo no ha pagado" };
    }

    await parkingSessionRepo.closeSession(session.id_parking);

    return { allowed: true, message: "Salida permitida. Buen viaje!" };
  }
}

export default new ParkingService();
