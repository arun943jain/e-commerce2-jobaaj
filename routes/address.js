import express from 'express'
import { isAuth } from '../middlewares/isAuth.js';
import { addAddress, deleteAddress, getAllAddress, getSingleAddress } from '../controllers/address.controller.js';

const router = express.Router();

router.post("/address/add", isAuth, addAddress )
router.get("/address/all", isAuth, getAllAddress)
router.get("/address/:id", isAuth, getSingleAddress)
router.delete("/address/delete/:id", isAuth, deleteAddress)

export default router;
