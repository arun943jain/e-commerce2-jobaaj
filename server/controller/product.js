import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";
import Product from "../models/Product.js";
import bufferGenerator from "../utils/bufferGenerator.js";
import tryCatch from "../utils/tryCatch.js";

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

const toNonNegativeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

const uploadImages = async (files) => {
  const uploads = files.map(async (file) => {
    const fileBuffer = bufferGenerator(file);
    const result = await cloudinary.v2.uploader.upload(fileBuffer.content);

    return {
      id: result.public_id,
      url: result.secure_url,
    };
  });

  return Promise.all(uploads);
};

export const createProduct = tryCatch(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "You are not admin" });
  }

  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: "Product images are required" });
  }

  const { title, features, about, category, price, stock } = req.body;
  const featuresValue = features ?? about;

  if (!title?.trim() || !featuresValue?.trim() || !category?.trim()) {
    return res
      .status(400)
      .json({ message: "Title, features and category are required" });
  }

  const parsedPrice = toNonNegativeNumber(price);
  const parsedStock = toNonNegativeNumber(stock);

  if (parsedPrice === null || parsedStock === null) {
    return res
      .status(400)
      .json({ message: "Price and stock must be non-negative numbers" });
  }

  const uploadedImages = await uploadImages(files);

  const product = await Product.create({
    title: title.trim(),
    features: featuresValue.trim(),
    category: category.trim(),
    price: parsedPrice,
    stock: parsedStock,
    images: uploadedImages,
  });

  return res.status(201).json({
    message: "Product created",
    product,
  });
});

export const getAllProducts = tryCatch(async (req, res) => {
  const { search, category, page, sortByPrice } = req.query;

  const filter = {};

  if (search) {
    filter.title = {
      $regex: search,
      $options: "i",
    };
  }

  if (category) {
    filter.category = category;
  }

  const limit = 8;
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (currentPage - 1) * limit;

  let sortOption = { createdAt: -1, _id: -1 };

  if (sortByPrice === "lowToHigh") {
    sortOption = { price: 1, _id: -1 };
  } else if (sortByPrice === "highToLow") {
    sortOption = { price: -1, _id: -1 };
  }

  const [products, categories, newProduct, countProduct] = await Promise.all([
    Product.find(filter).sort(sortOption).limit(limit).skip(skip),
    Product.distinct("category"),
    Product.find().sort({ createdAt: -1, _id: -1 }).limit(4),
    Product.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(countProduct / limit));

  return res.json({ products, categories, totalPages, newProduct });
});

export const getSingleProduct = tryCatch(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const relatedProduct = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  }).limit(4);

  return res.json({ product, relatedProduct });
});

export const deleteProduct = tryCatch(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "You are not admin" });
  }

  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({ message: "Product deleted successfully" });
});

export const updateProduct = tryCatch(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "You are not admin" });
  }

  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const { title, features, about, stock, category, price } = req.body;
  const featuresValue = features ?? about;
  const updateFields = {};

  if (title !== undefined) {
    if (!title.trim()) {
      return res.status(400).json({ message: "Title cannot be empty" });
    }
    updateFields.title = title.trim();
  }

  if (featuresValue !== undefined) {
    if (!featuresValue.trim()) {
      return res.status(400).json({ message: "Features cannot be empty" });
    }
    updateFields.features = featuresValue.trim();
  }

  if (category !== undefined) {
    if (!category.trim()) {
      return res.status(400).json({ message: "Category cannot be empty" });
    }
    updateFields.category = category.trim();
  }

  if (price !== undefined) {
    const parsedPrice = toNonNegativeNumber(price);

    if (parsedPrice === null) {
      return res
        .status(400)
        .json({ message: "Price must be a non-negative number" });
    }
    updateFields.price = parsedPrice;
  }

  if (stock !== undefined) {
    const parsedStock = toNonNegativeNumber(stock);

    if (parsedStock === null) {
      return res
        .status(400)
        .json({ message: "Stock must be a non-negative number" });
    }
    updateFields.stock = parsedStock;
  }

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: "No valid fields to update" });
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updateFields, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({
    message: "Product updated successfully",
    product,
  });
});

export const updateProductImage = tryCatch(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "You are not admin" });
  }

  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: "Product images are required" });
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const uploadedImages = await uploadImages(files);

  await Promise.all(
    (product.images || []).map((image) =>
      image.id
        ? cloudinary.v2.uploader.destroy(image.id).catch(() => null)
        : null
    )
  );

  product.images = uploadedImages;
  await product.save();

  return res.json({
    message: "Product images updated successfully",
    product,
  });
});
