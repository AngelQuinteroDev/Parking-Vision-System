import express from "express";
import multer from "multer";
import { detectPlate } from "../controllers/ocrController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("image"), detectPlate);

export default router;
