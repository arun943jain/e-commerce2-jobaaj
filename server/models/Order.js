import mongoose from "mongoose";

const ORDER_STATUSES = ["Pending", "Shipped", "Delivered"];
const PAYMENT_STATUSES = ["pending", "paid", "failed", "cancelled"];

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        quantity: {
          type: Number,
          required: true,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
        },
        price: {
          type: Number,
        },
      },
    ],
    method: {
      type: String,
      required: true,
    },
    paymentInfo: {
      type: String,
      index: { unique: true, sparse: true },
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "pending",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Pending",
    },
    paidAt: {
      type: String,
    },
    subTotal: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export { ORDER_STATUSES, PAYMENT_STATUSES };

export const Order = mongoose.model("Order", orderSchema);

export default Order;
