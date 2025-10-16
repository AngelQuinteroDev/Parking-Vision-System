import express from "express";
import sessionController from "../controllers/sessionController.js";

const router = express.Router();

// GET /api/sessions/active - Get all active sessions
router.get("/active", (req, res, next) => {
  sessionController.getAllActiveSessions(req, res, next);
});

// GET /api/sessions/stats - Get statistics of active sessions
router.get("/stats", (req, res, next) => {
  sessionController.getActiveSessionsStats(req, res, next);
});

// GET /api/sessions/active/:plate - Get active session by plate
router.get("/active/:plate", (req, res, next) => {
  sessionController.getActiveSessionByPlate(req, res, next);
});

// GET /api/sessions/active/:plate/rate - Get an active session with a fee
router.get("/active/:plate/rate", (req, res, next) => {
  sessionController.getActiveSessionWithRate(req, res, next);
});

export default router;