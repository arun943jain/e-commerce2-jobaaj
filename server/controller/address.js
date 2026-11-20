import mongoose from "mongoose";
import Address from "../models/Address.js";
import tryCatch from "../utils/tryCatch.js";

const parsePhone = (phone) => {
  const value = String(phone ?? "").trim();
  return /^\d{7,15}$/.test(value) ? Number(value) : null;
};

export const addAddress = tryCatch(async (req, res) => {
  const { address, phone } = req.body;
  const trimmedAddress = String(address ?? "").trim();
  const parsedPhone = parsePhone(phone);

  if (!trimmedAddress) {
    return res.status(400).json({ message: "Address is required" });
  }

  if (parsedPhone === null) {
    return res.status(400).json({ message: "A valid phone number is required" });
  }

  await Address.create({
    address: trimmedAddress,
    phone: parsedPhone,
    user: req.user._id,
  });

  return res.status(201).json({ message: "Address created successfully" });
});

export const getAllAddress = tryCatch(async (req, res) => {
  const allAddress = await Address.find({ user: req.user._id });

  return res.json(allAddress);
});

export const getSingleAddress = tryCatch(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid address id" });
  }

  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }

  return res.json(address);
});

export const updateAddress = tryCatch(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid address id" });
  }

  const trimmedAddress = String(req.body.address ?? "").trim();
  const parsedPhone = parsePhone(req.body.phone);

  if (!trimmedAddress) {
    return res.status(400).json({ message: "Address is required" });
  }

  if (parsedPhone === null) {
    return res.status(400).json({ message: "A valid phone number is required" });
  }

  const address = await Address.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { address: trimmedAddress, phone: parsedPhone } },
    { new: true, runValidators: true }
  );

  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }

  return res.json({ message: "Address updated successfully", address });
});

export const deleteAddress = tryCatch(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid address id" });
  }

  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!address) {
    return res.status(404).json({ message: "Address not found" });
  }

  await address.deleteOne();

  return res.json({ message: "Address deleted successfully" });
});
