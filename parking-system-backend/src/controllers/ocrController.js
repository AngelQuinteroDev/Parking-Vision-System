import ocrService from "../services/ocrService.js";
import  ParkingSessionRepository  from "../repositories/parkingSessionRepository.js";
import fs from "fs";

class OcrController {
  async detectEntrance(req, res) {
    try {
      const result = await ocrService.processEntrance(req.file, 1);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    } finally {
      if (req.file?.path) fs.unlink(req.file.path, () => {});
    }
  }


async detectExit(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se subió ninguna imagen" });
    }

    const result = await ocrService.processExit(req.file, 1);
    res.json(result);

  } catch (error) {
    next(error);
  } finally {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
  }
}
}

export default new OcrController();
