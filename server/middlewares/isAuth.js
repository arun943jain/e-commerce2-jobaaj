import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { getEnv } from "../utils/env.js";

const secret = () => getEnv("JWT_SECRET", "JWT_SEC");

export const isAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({ message: "Please login" });
    }

    const decodedData = jwt.verify(token, secret());
    const user = await User.findById(decodedData._id);

    if (!user) {
      return res.status(401).json({ message: "Please login" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Please login" });
  }
};
