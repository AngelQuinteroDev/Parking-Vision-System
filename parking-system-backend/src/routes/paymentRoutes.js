import express from "express";
import paymentController from "../controllers/paymentController.js";

const router = express.Router();

router.post("/:plate/pay", (req, res) => paymentController.pay(req, res));

export default router;
