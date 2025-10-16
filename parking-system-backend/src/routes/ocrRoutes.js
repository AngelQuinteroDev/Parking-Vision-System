import express from "express";
import multer from "multer";
import ocrController  from "../controllers/ocrController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("image"), (req, res) => ocrController.detectEntrance(req, res));

router.post("/exit", upload.single("image"), (req, res, next) => {ocrController.detectExit(req, res, next);});


export default router;
