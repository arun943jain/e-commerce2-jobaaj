import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    features: {
      type: String,
      required: [true, "Features are required"],
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    images: [
      {
        id: String,
        url: String,
      },
    ],
    sold: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema
  .virtual("about")
  .get(function () {
    return this.features;
  })
  .set(function (value) {
    this.features = value;
  });

export const Product = mongoose.model("Product", productSchema);

export default Product;
