import Stripe from "stripe";
import { getEnv } from "../utils/env.js";

let stripeClient = null;
let stripeKey = "";

export const getStripeSecretKey = () =>
  getEnv("STRIPE_SECRET_KEY", "Stripe_Secret_Key");

export const isStripeConfigured = () => Boolean(getStripeSecretKey());

export const getStripe = () => {
  const secretKey = getStripeSecretKey();

  if (!secretKey) {
    const error = new Error("Online payments are not configured");
    error.status = 503;
    throw error;
  }

  if (!stripeClient || stripeKey !== secretKey) {
    stripeClient = new Stripe(secretKey);
    stripeKey = secretKey;
  }

  return stripeClient;
};

export const getStripeWebhookSecret = () =>
  getEnv("STRIPE_WEBHOOK_SECRET", "Stripe_Webhook_Secret");

export const getFrontendUrl = () => {
  const configured =
    getEnv("FRONTEND_URL", "Frontend_Url", "CORS_ORIGIN") ||
    "http://localhost:5173";

  return configured.split(",")[0].trim().replace(/\/+$/, "");
};
