import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const fastApiClient = axios.create({
  baseURL: process.env.FASTAPI_URL,
  timeout: 10000,
});
