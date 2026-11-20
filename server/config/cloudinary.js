import "dotenv/config";
import cloudinary from "cloudinary";
import { getEnv } from "../utils/env.js";

cloudinary.v2.config({
  cloud_name: getEnv("CLOUD_NAME"),
  api_key: getEnv("CLOUDINARY_API_KEY", "CLOUD_API_KEY"),
  api_secret: getEnv("CLOUDINARY_API_SECRET", "CLOUD_API_SECRET"),
});

export default cloudinary;
