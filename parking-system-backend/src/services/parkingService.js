import parkingSessionRepo from "../repositories/parkingSessionRepository.js";

class ParkingService {
  async processExit(plate) {
    const session = await parkingSessionRepo.findActiveByPlate(plate);
    if (!session) return { allowed: false, message: "There is no active session" };

    if (!session.is_paid) {
      return { allowed: false, message: "The vehicle has not paid" };
    }

    await parkingSessionRepo.closeSession(session.id_parking);

    return { allowed: true, message: "Exit permitted" };
  }
}

export default new ParkingService();
