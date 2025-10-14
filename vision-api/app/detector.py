from ultralytics import YOLO
import easyocr
import cv2
import numpy as np

# Carga el modelo YOLO (usa tu archivo .pt)
yolo_model = YOLO("models/best.pt")
reader = easyocr.Reader(['en'], gpu=False)  # GPU=True si tienes CUDA local

def detect_license_plate(image_bytes: bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    results = yolo_model(img)
    detections = results[0].boxes.data.cpu().numpy()

    plates = []
    for det in detections:
        x1, y1, x2, y2, conf, cls = det
        roi = img[int(y1):int(y2), int(x1):int(x2)]
        if roi.size == 0:
            continue

        ocr_result = reader.readtext(roi)
        text = "".join([r[1] for r in ocr_result])
        if text:
            plates.append({
                "plate": text,
                "confidence": float(conf)
            })
    return plates
