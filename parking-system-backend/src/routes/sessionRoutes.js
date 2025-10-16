import express from "express";
import sessionController from "../controllers/sessionController.js";

const router = express.Router();

// 📋 GET /api/sessions/active - Obtener todas las sesiones activas
router.get("/active", (req, res, next) => {
  sessionController.getAllActiveSessions(req, res, next);
});

// 📊 GET /api/sessions/stats - Obtener estadísticas de sesiones activas
router.get("/stats", (req, res, next) => {
  sessionController.getActiveSessionsStats(req, res, next);
});

// 🔍 GET /api/sessions/active/:plate - Obtener sesión activa por placa
router.get("/active/:plate", (req, res, next) => {
  sessionController.getActiveSessionByPlate(req, res, next);
});

// 📊 GET /api/sessions/active/:plate/rate - Obtener sesión activa con tarifa
router.get("/active/:plate/rate", (req, res, next) => {
  sessionController.getActiveSessionWithRate(req, res, next);
});

export default router;