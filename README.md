# Parking Vision

Parking Vision is an intelligent parking management system that combines AI-based license plate recognition, session and payment control, and real-time monitoring of vehicle entries and exits.

# Overview
Parking Vision is a modular system made up of two main services:

*  Vision API (Python + FastAPI + YOLO + EasyOCR): Detects vehicle license plates from images using deep learning.

* Parking System Backend (Node.js + Express + MySQL): Manages parking sessions, rates, payments, and access control (entry/exit).

The system is designed to integrate with entry and exit cameras and automatically control barriers or gates based on the vehicle’s payment status.

 ## 🛠 Installation

1. **Clone the repository**

```
git clone https://github.com/AngelQuinteroDev/Parking-Vision-System
cd parking-vision
```
2. **Vision API (Python)**
```
cd vision-api
python -m venv venv
source venv/bin/activate   # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
3. **Backend (Node.js)**

```
cd ../parking-system-backend
npm install
npm run dev
```
The backend will start at:
http://localhost:3000

4. **Database Config**

Parking Vision uses MySQL.

Example .env file:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=parking_db
PORT=3000
```
Main Tables

+ vehicles
+ parking_sessions
+ rates
+ payments
+ audit_logs


## 🔗 Endpoints Overview

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **POST** | `/detect` | Detects license plates in uploaded images (Vision API - FastAPI). |
| **POST** | `/api/ocr/entrance` | Processes vehicle entry and creates a new parking session. |
| **POST** | `/api/ocr/exit` | Processes vehicle exit; blocks if payment is pending. |
| **POST** | `/api/parking/pay` | Registers a payment and closes the parking session. |
| **GET**  | `/api/sessions/active` | Lists all currently active parking sessions. |
| **GET**  | `/api/sessions/stats` | Displays session statistics. |

