import ParkingSessionRepository from "../repositories/parkingSessionRepository.js";
import logger from "../utils/logger.js";
import { createError } from "../middleware/errorHandler.js";

class SessionController {
  // Get all active sessions
  async getAllActiveSessions(req, res, next) {
    try {
      logger.info("Fetching all active sessions");

      const activeSessions = await ParkingSessionRepository.findAllActive();

      logger.info("Active sessions retrieved", {
        count: activeSessions.length,
      });

      res.json({
        status: "success",
        count: activeSessions.length,
        data: activeSessions,
      });
    } catch (error) {
      logger.error("Error retrieving active sessions", {
        error: error.message,
      });
      next(error);
    }
  }

  // Get active session by license plate
  async getActiveSessionByPlate(req, res, next) {
    try {
      const { plate } = req.params;

      if (!plate) {
        throw createError("License plate not provided", 400);
      }

      logger.info("Searching for active session", { plate });

      const session = await ParkingSessionRepository.findActiveByPlate(plate);

      if (!session) {
        throw createError("No active session found for this license plate", 404);
      }

      logger.info("Active session found", {
        plate,
        sessionId: session.id_parking,
      });

      res.json({
        status: "success",
        data: session,
      });
    } catch (error) {
      logger.error("Error finding active session", {
        error: error.message,
        plate: req.params.plate,
      });
      next(error);
    }
  }

  // Get active session with rate information
  async getActiveSessionWithRate(req, res, next) {
    try {
      const { plate } = req.params;

      if (!plate) {
        throw createError("License plate not provided", 400);
      }

      logger.info("Searching for active session with rate", { plate });

      const session = await ParkingSessionRepository.findActiveWithRate(plate);

      if (!session) {
        throw createError("No active session found for this license plate", 404);
      }

      // Calculate elapsed time
      const entryTime = new Date(session.entry_time);
      const currentTime = new Date();
      const elapsedMinutes = Math.ceil((currentTime - entryTime) / 60000);

      // Calculate current price
      let currentPrice = elapsedMinutes * session.price_per_minute;
      if (session.min_charge && currentPrice < session.min_charge) {
        currentPrice = session.min_charge;
      }

      logger.info("Active session with rate found", {
        plate,
        sessionId: session.id_parking,
        elapsedMinutes,
        currentPrice,
      });

      res.json({
        status: "success",
        data: {
          ...session,
          elapsed_minutes: elapsedMinutes,
          current_price: currentPrice,
        },
      });
    } catch (error) {
      logger.error("Error retrieving active session with rate", {
        error: error.message,
        plate: req.params.plate,
      });
      next(error);
    }
  }

  // Get active session statistics
  async getActiveSessionsStats(req, res, next) {
    try {
      logger.info("Fetching active session statistics");

      const activeSessions = await ParkingSessionRepository.findAllActive();

      const stats = {
        total_active_sessions: activeSessions.length,
        paid_sessions: activeSessions.filter((s) => s.is_paid).length,
        unpaid_sessions: activeSessions.filter((s) => !s.is_paid).length,
        sessions: activeSessions.map((session) => {
          const entryTime = new Date(session.entry_time);
          const currentTime = new Date();
          const elapsedMinutes = Math.ceil((currentTime - entryTime) / 60000);

          return {
            plate: session.vehicle_plate,
            entry_time: session.entry_time,
            elapsed_minutes: elapsedMinutes,
            is_paid: session.is_paid,
          };
        }),
      };

      logger.info("Session statistics generated", {
        totalSessions: stats.total_active_sessions,
      });

      res.json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      logger.error("Error generating session statistics", {
        error: error.message,
      });
      next(error);
    }
  }
}

export default new SessionController();
