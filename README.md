# Parking Vision

Parking Vision is an intelligent parking management system that combines AI-based license plate recognition, session and payment control, and real-time monitoring of vehicle entries and exits.

# Overview
Parking Vision is a modular system made up of two main services:

*  Vision API (Python + FastAPI + YOLO + EasyOCR): Detects vehicle license plates from images using deep learning.

* Parking System Backend (Node.js + Express + MySQL): Manages parking sessions, rates, payments, and access control (entry/exit).

The system is designed to integrate with entry and exit cameras and automatically control barriers or gates based on the vehicle’s payment status.