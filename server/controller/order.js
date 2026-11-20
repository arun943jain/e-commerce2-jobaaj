import mongoose from "mongoose";
import {
  getFrontendUrl,
  getStripe,
  getStripeWebhookSecret,
} from "../config/stripe.js";
import Cart from "../models/Cart.js";
import Order, { ORDER_STATUSES } from "../models/Order.js";
import Product from "../models/Product.js";
import {
  buildOrderItems,
  buildStripeLineItems,
  isPaidSession,
  normalizeOnlineOrderInput,
  sessionMatchesOrder,
} from "../utils/payment.js";
import sendOrderConfirmation from "../utils/sendOrderConfirmation.js";
import TryCatch from "../utils/TryCatch.js";

const restoreStock = async (items) => {
  await Promise.all(
    items.map((item) =>
      Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity, sold: -item.quantity } }
      )
    )
  );
};

const reserveStock = async (items) => {
  const reserved = [];

  try {
    for (const item of items) {
      const result = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, sold: item.quantity } }
      );

      if (result.modifiedCount !== 1) {
        const error = new Error(`Not enough stock for ${item.name}`);
        error.status = 400;
        throw error;
      }

      reserved.push(item);
    }
  } catch (error) {
    await restoreStock(reserved);
    throw error;
  }
};

export const newOrderCod = TryCatch(async (req, res) => {
  const { method, phone, address } = req.body;

  if (String(method ?? "").toLowerCase() !== "cod") {
    return res
      .status(400)
      .json({ message: "Only cash on delivery is supported" });
  }

  const trimmedAddress = String(address ?? "").trim();
  const phoneValue = String(phone ?? "").trim();

  if (!trimmedAddress || !/^\d{7,15}$/.test(phoneValue)) {
    return res
      .status(400)
      .json({ message: "A valid phone number and address are required" });
  }

  const cart = await Cart.find({ user: req.user._id }).populate({
    path: "product",
    select: "title price stock",
  });

  if (!cart.length) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const missingProductIds = cart
    .filter((entry) => !entry.product)
    .map((entry) => entry._id);

  if (missingProductIds.length > 0) {
    await Cart.deleteMany({ _id: { $in: missingProductIds } });
    return res.status(400).json({
      message: "Some items are no longer available. Please review your cart.",
    });
  }

  let unavailableItem = null;

  const items = cart.map((entry) => {
    if (entry.quantity > entry.product.stock) {
      unavailableItem = entry.product.title;
    }

    return {
      product: entry.product._id,
      name: entry.product.title,
      price: entry.product.price,
      quantity: entry.quantity,
    };
  });

  if (unavailableItem) {
    return res.status(400).json({
      message: `Not enough stock for ${unavailableItem}`,
    });
  }

  const subTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const order = await Order.create({
    items: items.map(({ product, quantity }) => ({ product, quantity })),
    method: "cod",
    user: req.user._id,
    phone: Number(phoneValue),
    address: trimmedAddress,
    subTotal,
    paymentStatus: "pending",
  });

  const applied = [];

  try {
    for (const item of items) {
      const result = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, sold: item.quantity } }
      );

      if (result.modifiedCount !== 1) {
        const error = new Error(`Not enough stock for ${item.name}`);
        error.status = 400;
        throw error;
      }

      applied.push(item);
    }
  } catch (error) {
    await restoreStock(applied);
    await Order.findByIdAndDelete(order._id);
    throw error;
  }

  try {
    await Cart.deleteMany({ user: req.user._id });
  } catch {
  }

  try {
    await sendOrderConfirmation({
      email: req.user.email,
      subject: "Order Confirmation",
      orderId: order._id,
      products: items,
      totalAmount: subTotal,
    });
  } catch {
  }

  return res.status(201).json({
    message: "Order created successfully",
    orderId: order._id,
    order,
  });
});

export const getAllOrders = TryCatch(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
    $or: [{ method: "cod" }, { method: "online", paymentStatus: "paid" }],
  }).sort({
    createdAt: -1,
  });

  return res.json({ orders });
});

export const getAllOrdersAdmin = TryCatch(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "You are not admin" });
  }

  const orders = await Order.find().populate("user").sort({ createdAt: -1 });

  return res.json(orders);
});

export const getMyOrder = TryCatch(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid order id" });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const isOwner = order.user.toString() === req.user._id.toString();

  if (!isOwner && req.user.role !== "admin") {
    return res.status(403).json({ message: "This is not your order" });
  }

  await order.populate([{ path: "items.product" }, { path: "user" }]);

  return res.json(order);
});

export const updateStatus = TryCatch(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "You are not admin" });
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid order id" });
  }

  const { status } = req.body;

  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({
      message: `Status must be one of: ${ORDER_STATUSES.join(", ")}`,
    });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  await order.save();

  return res.json({
    message: "Order status updated successfully",
    order,
  });
});

export const getStats = TryCatch(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "You are not admin" });
  }

  const [cod, online, products, pending, shipped, delivered] =
    await Promise.all([
      Order.countDocuments({ method: "cod" }),
      Order.countDocuments({ method: "online", paymentStatus: "paid" }),
      Product.find().select("title sold"),
      Order.countDocuments({ status: "Pending" }),
      Order.countDocuments({ status: "Shipped" }),
      Order.countDocuments({ status: "Delivered" }),
    ]);

  const data = products.map((product) => ({
    name: product.title,
    sold: product.sold,
  }));

  return res.json({
    cod,
    online,
    data,
    statuses: { Pending: pending, Shipped: shipped, Delivered: delivered },
  });
});

const clearCartForUser = async (userId) => {
  try {
    await Cart.deleteMany({ user: userId });
  } catch {
  }
};

export const completePaidOrder = async (session, { notify = true } = {}) => {
  const order = await Order.findOne({ paymentInfo: session.id });

  if (!order) {
    const error = new Error("Order not found for this payment session");
    error.status = 404;
    throw error;
  }

  if (!sessionMatchesOrder(session, order)) {
    const error = new Error("Payment session does not match the order");
    error.status = 400;
    throw error;
  }

  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: "pending" },
    { $set: { paymentStatus: "paid", paidAt: new Date().toISOString() } },
    { returnDocument: "after" }
  ).populate("user", "email");

  if (!claimed) {
    const current = await Order.findById(order._id).populate("user", "email");

    if (current?.paymentStatus === "paid") {
      return { order: current, alreadyProcessed: true };
    }

    const error = new Error("Order is not awaiting payment");
    error.status = 409;
    throw error;
  }

  await clearCartForUser(claimed.user?._id || claimed.user);

  if (notify && claimed.user?.email) {
    try {
      await sendOrderConfirmation({
        email: claimed.user.email,
        subject: "Order Confirmation",
        orderId: claimed._id,
        products: claimed.items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: claimed.subTotal,
      });
    } catch {
    }
  }

  return { order: claimed, alreadyProcessed: false };
};

export const cancelPendingOrder = async (sessionId) => {
  const claimed = await Order.findOneAndUpdate(
    { paymentInfo: sessionId, paymentStatus: "pending" },
    { $set: { paymentStatus: "cancelled" } },
    { returnDocument: "before" }
  );

  if (!claimed) return null;

  await restoreStock(claimed.items);
  await Order.deleteOne({ _id: claimed._id });

  return claimed;
};

export const newOrderOnline = TryCatch(async (req, res) => {
  const { method, phone, address } = req.body ?? {};
  const input = normalizeOnlineOrderInput({ method, phone, address });

  const cart = await Cart.find({ user: req.user._id }).populate({
    path: "product",
    select: "title price stock images",
  });

  if (!cart.length) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const missingProductIds = cart
    .filter((entry) => !entry.product)
    .map((entry) => entry._id);

  if (missingProductIds.length > 0) {
    await Cart.deleteMany({ _id: { $in: missingProductIds } });
    return res.status(400).json({
      message: "Some items are no longer available. Please review your cart.",
    });
  }

  const built = buildOrderItems(cart);

  if (built.unavailable) {
    return res.status(400).json({
      message: `Not enough stock for ${built.unavailable}`,
    });
  }

  const stripe = getStripe();
  const frontendUrl = getFrontendUrl();

  const order = await Order.create({
    items: built.items.map(({ product, name, price, quantity }) => ({
      product,
      name,
      price,
      quantity,
    })),
    method: "online",
    user: req.user._id,
    phone: input.phone,
    address: input.address,
    subTotal: built.subTotal,
    paymentStatus: "pending",
  });

  try {
    await reserveStock(built.items);
  } catch (error) {
    await Order.deleteOne({ _id: order._id });
    throw error;
  }

  let session;

  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: buildStripeLineItems(built.items),
      ...(req.user.email ? { customer_email: req.user.email } : {}),
      client_reference_id: String(order._id),
      success_url: `${frontendUrl}/ordersuccess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/cart`,
      metadata: {
        orderId: String(order._id),
        userId: String(req.user._id),
      },
    });

    if (!session?.id || !session?.url) {
      throw new Error("Stripe did not return a checkout URL");
    }

    order.paymentInfo = session.id;
    await order.save();
  } catch (error) {
    console.error("Stripe session creation failed:", error.message);

    await restoreStock(built.items);
    await Order.deleteOne({ _id: order._id });

    if (session?.id) {
      try {
        await stripe.checkout.sessions.expire(session.id);
      } catch {
      }
    }

    const sessionError = new Error("Failed to create payment session");
    sessionError.status = 502;
    throw sessionError;
  }

  return res.status(201).json({
    url: session.url,
    orderId: order._id,
  });
});

export const verifyPayment = TryCatch(async (req, res) => {
  const { sessionId } = req.body ?? {};

  if (
    typeof sessionId !== "string" ||
    !sessionId.trim() ||
    sessionId.length > 255
  ) {
    return res
      .status(400)
      .json({ message: "A valid payment session id is required" });
  }

  const order = await Order.findOne({ paymentInfo: sessionId.trim() });

  if (!order) {
    return res
      .status(404)
      .json({ message: "Order not found for this payment session" });
  }

  if (String(order.user) !== String(req.user._id)) {
    return res
      .status(403)
      .json({ message: "This payment session does not belong to you" });
  }

  const stripe = getStripe();
  let session;

  try {
    session = await stripe.checkout.sessions.retrieve(order.paymentInfo);
  } catch (error) {
    if (error?.type === "StripeInvalidRequestError") {
      return res.status(400).json({ message: "Invalid payment session" });
    }

    const stripeError = new Error("Could not verify the payment session");
    stripeError.status = 502;
    throw stripeError;
  }

  if (!sessionMatchesOrder(session, order)) {
    return res
      .status(400)
      .json({ message: "Payment session does not match the order" });
  }

  if (!isPaidSession(session)) {
    return res.status(400).json({
      success: false,
      message: "Payment has not been completed",
    });
  }

  const { order: paidOrder, alreadyProcessed } = await completePaidOrder(
    session
  );

  return res.json({
    success: true,
    message: alreadyProcessed
      ? "Order already confirmed"
      : "Order placed successfully",
    order: paidOrder,
  });
});

export const stripeWebhook = async (req, res, next) => {
  try {
    const webhookSecret = getStripeWebhookSecret();

    if (!webhookSecret) {
      return res
        .status(503)
        .json({ message: "Stripe webhook is not configured" });
    }

    const signature = req.headers["stripe-signature"];

    if (!signature) {
      return res.status(400).json({ message: "Missing Stripe signature" });
    }

    const stripe = getStripe();
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch {
      return res.status(400).json({ message: "Invalid Stripe signature" });
    }

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object;

      if (isPaidSession(session)) {
        try {
          await completePaidOrder(session);
        } catch (error) {
          if (![400, 404, 409].includes(error.status)) {
            throw error;
          }

          console.error(
            "Stripe webhook could not confirm the order:",
            error.message
          );
        }
      }
    } else if (
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "checkout.session.expired"
    ) {
      await cancelPendingOrder(event.data.object.id);
    }

    return res.json({ received: true });
  } catch (error) {
    next(error);
  }
};
