import ParkingSessionRepository from "../repositories/parkingSessionRepository.js";
import logger from "../utils/logger.js";
import { createError } from "../middleware/errorHandler.js";

class SessionController {
  // 📋 Obtener todas las sesiones activas
  async getAllActiveSessions(req, res, next) {
    try {
      logger.info("📋 Consultando todas las sesiones activas");

      const activeSessions = await ParkingSessionRepository.findAllActive();

      logger.info("✅ Sesiones activas obtenidas", {
        count: activeSessions.length,
      });

      res.json({
        status: "success",
        count: activeSessions.length,
        data: activeSessions,
      });
    } catch (error) {
      logger.error("❌ Error al obtener sesiones activas", {
        error: error.message,
      });
      next(error);
    }
  }

  // 🔍 Obtener sesión activa por placa
  async getActiveSessionByPlate(req, res, next) {
    try {
      const { plate } = req.params;

      if (!plate) {
        throw createError("Placa no proporcionada", 400);
      }

      logger.info("🔍 Buscando sesión activa", { plate });

      const session = await ParkingSessionRepository.findActiveByPlate(plate);

      if (!session) {
        throw createError("No hay sesión activa para esta placa", 404);
      }

      logger.info("✅ Sesión encontrada", {
        plate,
        sessionId: session.id_parking,
      });

      res.json({
        status: "success",
        data: session,
      });
    } catch (error) {
      logger.error("❌ Error al buscar sesión", {
        error: error.message,
        plate: req.params.plate,
      });
      next(error);
    }
  }

  // 📊 Obtener sesión activa con información de tarifa
  async getActiveSessionWithRate(req, res, next) {
    try {
      const { plate } = req.params;

      if (!plate) {
        throw createError("Placa no proporcionada", 400);
      }

      logger.info("🔍 Buscando sesión activa con tarifa", { plate });

      const session = await ParkingSessionRepository.findActiveWithRate(plate);

      if (!session) {
        throw createError("No hay sesión activa para esta placa", 404);
      }

      // Calcular tiempo transcurrido
      const entryTime = new Date(session.entry_time);
      const currentTime = new Date();
      const elapsedMinutes = Math.ceil((currentTime - entryTime) / 60000);

      // Calcular precio actual
      let currentPrice = elapsedMinutes * session.price_per_minute;
      if (session.min_charge && currentPrice < session.min_charge) {
        currentPrice = session.min_charge;
      }

      logger.info("✅ Sesión con tarifa encontrada", {
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
      logger.error("❌ Error al buscar sesión con tarifa", {
        error: error.message,
        plate: req.params.plate,
      });
      next(error);
    }
  }

  // 📊 Obtener estadísticas de sesiones activas
  async getActiveSessionsStats(req, res, next) {
    try {
      logger.info("📊 Consultando estadísticas de sesiones activas");

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

      logger.info("✅ Estadísticas generadas", {
        totalSessions: stats.total_active_sessions,
      });

      res.json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      logger.error("❌ Error al generar estadísticas", {
        error: error.message,
      });
      next(error);
    }
  }
}

export default new SessionController();