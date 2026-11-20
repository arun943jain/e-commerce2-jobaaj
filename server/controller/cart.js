import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import tryCatch from "../utils/tryCatch.js";

export const addToCart = tryCatch(async (req, res) => {
  const { product } = req.body;

  if (!mongoose.isValidObjectId(product)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const productData = await Product.findById(product);

  if (!productData) {
    return res.status(404).json({ message: "Product not found" });
  }

  const existing = await Cart.findOne({
    product,
    user: req.user._id,
  });

  if (existing) {
    if (existing.quantity >= productData.stock) {
      return res.status(400).json({ message: "Out of stock" });
    }

    existing.quantity += 1;
    await existing.save();

    return res.json({ message: "Product added to cart" });
  }

  if (productData.stock <= 0) {
    return res.status(400).json({ message: "Out of stock" });
  }

  await Cart.create({
    quantity: 1,
    product,
    user: req.user._id,
  });

  return res.json({ message: "Product added to cart" });
});

export const removeFromCart = tryCatch(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid cart item id" });
  }

  const cart = await Cart.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!cart) {
    return res.status(404).json({ message: "Cart item not found" });
  }

  await cart.deleteOne();

  return res.json({ message: "Product removed from cart" });
});

export const updateCart = tryCatch(async (req, res) => {
  const { action } = req.query;

  if (!["inc", "dec"].includes(action)) {
    return res.status(400).json({ message: "Invalid cart action" });
  }

  const { id } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid cart item id" });
  }

  const cart = await Cart.findOne({
    _id: id,
    user: req.user._id,
  }).populate("product");

  if (!cart) {
    return res.status(404).json({ message: "Cart item not found" });
  }

  if (!cart.product) {
    await cart.deleteOne();
    return res
      .status(400)
      .json({ message: "This product is no longer available" });
  }

  if (action === "inc") {
    if (cart.quantity >= cart.product.stock) {
      return res.status(400).json({ message: "Out of stock" });
    }

    cart.quantity += 1;
  } else {
    if (cart.quantity <= 1) {
      return res
        .status(400)
        .json({ message: "You have only one item in cart" });
    }

    cart.quantity -= 1;
  }

  await cart.save();

  return res.json({ message: "Cart updated successfully" });
});

export const fetchCart = tryCatch(async (req, res) => {
  const cart = await Cart.find({ user: req.user._id }).populate("product");

  const validCart = cart.filter((item) => item.product);

  const totalQuantities = validCart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subTotal = validCart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return res.json({
    cart: validCart,
    subTotal,
    totalQuantities,
    sumofQuantities: totalQuantities,
  });
});
