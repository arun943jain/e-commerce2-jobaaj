import jwt from "jsonwebtoken";
import Otp from "../models/Otp.js";
import User from "../models/User.js";
import { getEnv } from "../utils/env.js";
import sendOtp from "../utils/sendOtp.js";
import tryCatch from "../utils/tryCatch.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createToken = (userId) =>
  jwt.sign({ _id: userId }, getEnv("JWT_SECRET", "JWT_SEC"), {
    expiresIn: "15d",
  });

export const loginUser = tryCatch(async (req, res) => {
  const email = String(req.body.email ?? "").trim();

  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: "A valid email is required" });
  }

  const subject = "WellShop Login";
  const otp = Math.floor(100000 + Math.random() * 900000);

  const prevOtp = await Otp.findOne({ email });

  if (prevOtp) {
    await prevOtp.deleteOne();
  }

  await sendOtp({ email, subject, otp });
  await Otp.create({ email, otp });

  return res.json({ message: "OTP sent to your email" });
});

export const verifyUser = tryCatch(async (req, res) => {
  const email = String(req.body.email ?? "").trim();
  const otp = Number(req.body.otp);

  if (!emailPattern.test(email) || !Number.isInteger(otp)) {
    return res.status(400).json({ message: "Invalid email or OTP" });
  }

  const haveOtp = await Otp.findOne({ email, otp });

  if (!haveOtp) {
    return res.status(400).json({ message: "Wrong OTP" });
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({ email });
  }

  await haveOtp.deleteOne();

  return res.status(200).json({
    message: "User logged in",
    token: createToken(user._id),
    user,
  });
});

export const myProfile = tryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  return res.json(user);
});
