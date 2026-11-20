import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./config/cloudinary.js";
import { isStripeConfigured } from "./config/stripe.js";
import { stripeWebhook } from "./controller/order.js";
import { getEnv } from "./utils/env.js";
import connectDb from "./utils/db.js";

dotenv.config();

const app = express();

const allowedOrigins = (
  getEnv("CORS_ORIGIN") ||
  "http://localhost:5173,http://localhost:5175,http://localhost:4173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.post(
  "/api/order/webhook/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(express.json());

import userRoutes from "./routes/user.js";
import productRoutes from "./routes/product.js";
import cartRoutes from "./routes/cart.js";
import addressRoutes from "./routes/address.js";
import orderRoutes from "./routes/order.js";

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api", cartRoutes);
app.use("/api", addressRoutes);
app.use("/api", orderRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  let status = error.status || error.statusCode || 500;
  let message = error.message || "Internal server error";

  if (error.name === "CastError") {
    status = 400;
    message = "Invalid identifier";
  } else if (error.name === "ValidationError") {
    status = 400;
    message = Object.values(error.errors)
      .map((item) => item.message)
      .join(", ");
  } else if (error.code === 11000) {
    status = 400;
    message = "Duplicate value";
  } else if (error.code === "LIMIT_FILE_SIZE") {
    status = 400;
    message = "Each image must be 5 MB or smaller";
  } else if (error.code === "LIMIT_FILE_COUNT") {
    status = 400;
    message = "Too many files";
  }

  if (status >= 500) {
    console.error(error);

    if (process.env.NODE_ENV === "production") {
      message = "Internal server error";
    }
  }

  res.status(status).json({ message });
});

const missingEnv = [
  !getEnv("MONGO_URL") && "MONGO_URL",
  !getEnv("JWT_SECRET", "JWT_SEC") && "JWT",
  !(
    getEnv("CLOUD_NAME") &&
    getEnv("CLOUDINARY_API_KEY", "CLOUD_API_KEY") &&
    getEnv("CLOUDINARY_API_SECRET", "CLOUD_API_SECRET")
  ) && "CLOUDINARY",
  !(getEnv("EMAIL_USER", "Gmail") &&
    getEnv("EMAIL_PASSWORD", "Password")) && "EMAIL",
].filter(Boolean);

if (missingEnv.length > 0 && process.env.NODE_ENV !== "test") {
  console.error(
    `Missing required environment variables: ${missingEnv.join(", ")}`
  );
  process.exit(1);
}

const port = process.env.PORT || 4000;

if (!isStripeConfigured() && process.env.NODE_ENV !== "test") {
  console.warn(
    "STRIPE_SECRET_KEY is not set; online payments are disabled until it is configured"
  );
}

const start = async () => {
  try {
    await connectDb();
    app.listen(port, () => {
      console.log(`server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

start();
