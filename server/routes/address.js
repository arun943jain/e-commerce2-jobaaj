import express from "express";
import {
  addAddress,
  deleteAddress,
  getAllAddress,
  getSingleAddress,
  updateAddress,
} from "../controller/address.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/address/new", isAuth, addAddress);
router.post("/address/add", isAuth, addAddress);
router.get("/address/all", isAuth, getAllAddress);
router.get("/address/:id", isAuth, getSingleAddress);
router.put("/address/:id", isAuth, updateAddress);
router.delete("/address/:id", isAuth, deleteAddress);
router.delete("/address/delete/:id", isAuth, deleteAddress);

export default router;
