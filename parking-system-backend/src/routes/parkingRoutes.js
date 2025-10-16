import express from "express";
import parkingController from "../controllers/parkingController.js";

const router = express.Router();

router.post("/pay", (req, res, next) => parkingController.registerPayment(req, res, next));

export default router;
