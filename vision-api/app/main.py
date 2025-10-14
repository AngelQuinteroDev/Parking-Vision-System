from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from app.detector import detect_license_plate

app = FastAPI(title="Parking Vision API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/detect")
async def detect_plate(file: UploadFile = File(...)):
    image_bytes = await file.read()
    results = detect_license_plate(image_bytes)
    if not results:
        return {"status": "no_plate_detected"}
    return {"status": "success", "plates": results}
