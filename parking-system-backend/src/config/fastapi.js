import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const fastApiClient = axios.create({
  baseURL: process.env.FASTAPI_URL || "http://127.0.0.1:8000",
  timeout: 10000,
});
