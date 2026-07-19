import { Response } from "express";
import { Product } from "../models/product";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { tryCatch } from "../utils/tryCatch";
import mongoose from "mongoose";
import { createSlug } from "../utils/createSlug";
import { Wishlist } from "../models/wishlist";


const sortOptionsMap: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  popular: { reviews: -1 },
  "top-rated": { rating: -1 },
  "low-to-high": { price: 1 },
  "high-to-low": { price: -1 },
};

// const getAllProducts = tryCatch(async (req: any, res: Response): Promise<any> => {

//   const page = parseInt(req.query.page, 10) || 1;
//   const limit = parseInt(req.query.limit, 10) || 10;
//   const keyword = req.query.keyword || "";
//   const category = req.query.category || "";
//   const sortBy = req.query.sortBy || "popular"; // popular | newest | top-rated | low-to-high | high-to-low

//   const sortStage = sortOptionsMap[sortBy] || sortOptionsMap["newest"];

//   // fetch the current user's wishlist product ids (empty array if not logged in / no wishlist yet)
//   let wishedProductIds: mongoose.Types.ObjectId[] = [];
//   if (req.user?._id && req.user.role !== "admin") {
//     const wishlist: any = await Wishlist.findOne({ user: req.user._id }).select("products").lean();
//     wishedProductIds = wishlist?.products ?? [];
//   }

//   const aggregate = Product.aggregate([
//     {
//       $match: {
//         ...(keyword ? { title: { $regex: keyword, $options: "i" } } : {}),
//         ...(category ? { category: new mongoose.Types.ObjectId(category) } : {}),
//       }
//     },
//     {
//       $lookup: {
//         from: "categories",
//         localField: "category",
//         foreignField: "_id",
//         as: "category",
//         pipeline: [{
//           $project: {
//             name: 1
//           }
//         }]
//       }
//     },
//     { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
//     {
//       $addFields: {
//         wished: { $in: ["$_id", wishedProductIds] },
//       },
//     },
//     { $sort: sortStage },
//   ]);

//   const options = { page, limit };

//   const result = await (Product as any).aggregatePaginate(aggregate, options);

//   return ApiResponse(res, "Products fetched successfully", result, 200);


// });

const getAllProducts = tryCatch(async (req: any, res: Response): Promise<any> => {

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const keyword = req.query.keyword || "";
  const categorySlug = req.query.category || "";
  const subCategorySlug = req.query.subCategory || "";
  const sortBy = req.query.sortBy || "newest"; // popular | newest | top-rated | low-to-high | high-to-low
  const filter = req.query.filter || ""; // e.g. "sale"

  const sortStage = sortOptionsMap[sortBy] || sortOptionsMap["newest"];

  // fetch the current user's wishlist product ids (empty array if not logged in / no wishlist yet)
  let wishedProductIds: mongoose.Types.ObjectId[] = [];
  if (req.user?._id) {
    const wishlist: any = await Wishlist.findOne({ user: req.user._id }).select("products").lean();
    wishedProductIds = wishlist?.products ?? [];
  }

  const aggregate = Product.aggregate([
    {
      $match: {
        ...(keyword ? { title: { $regex: keyword, $options: "i" } } : {}),
        ...(filter === "sale" ? { discountedPrice: { $ne: null } } : {}),
      }
    },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
        pipeline: [{ $project: { name: 1, slug: 1 } }],
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "subcategories",
        localField: "subCategory",
        foreignField: "_id",
        as: "subCategory",
        pipeline: [{ $project: { name: 1, slug: 1 } }],
      },
    },
    { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true } },
    {
      // slug-based filters applied AFTER the lookups, since slug only exists on joined docs
      $match: {
        ...(categorySlug ? { "category.slug": categorySlug } : {}),
        ...(subCategorySlug ? { "subCategory.slug": subCategorySlug } : {}),
      }
    },
    {
      $addFields: {
        wished: { $in: ["$_id", wishedProductIds] },
      },
    },
    { $sort: sortStage },
  ]);

  const options = { page, limit };

  const result = await (Product as any).aggregatePaginate(aggregate, options);

  return ApiResponse(res, "Products fetched successfully", result, 200);

});

const getProductById = tryCatch(async (req: any, res: Response): Promise<any> => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Product id is required");
  }

  const product = await Product.findById(id).populate("category", "name");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return ApiResponse(res, "Product fetched successfully", product);

});

const getProductBySlug = tryCatch(async (req: any, res: Response): Promise<any> => {

  const { slug } = req.params;

  const product = await Product.findOne({ slug }).populate("category", "name");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return ApiResponse(res, "Product fetched successfully", product);

});

const addProduct = tryCatch(async (req: any, res: Response): Promise<any> => {

  const { category, subCategory, title, description, price, discountedPrice, rating, reviews } = req.body;
  const image = req?.files && req?.files?.image ? req?.files?.image[0]?.path : null;

  if (!image) {
    throw new ApiError(400, "Product image is required");
  }


  const product = await Product.create({
    category,
    subCategory,
    title,
    description,
    slug: createSlug(title),
    price,
    discountedPrice: Number(discountedPrice) === 0 ? null : discountedPrice,
    rating,
    reviews,
    image
  });

  return ApiResponse(res, "Product added successfully", product);

});

const updateProduct = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { id } = req.params;

  const { category, subCategory, title, description, price, discountedPrice, rating, reviews, inStock } = req.body;
  const image = req?.files && req?.files?.image ? req?.files?.image[0]?.path : null;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Product id is required");
  }

  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (inStock !== undefined) {
    const inStockValue = inStock === "true" || inStock === true;
    if (typeof inStockValue !== "boolean") {
      throw new ApiError(400, "inStock must be a boolean value");
    }
    product.inStock = inStockValue;
  }

  if (category) product.category = category;
  if (subCategory) product.subCategory = subCategory;
  if (title) {
    product.title = title;
    product.slug = createSlug(title);
  }
  if (description) product.description = description;
  if (price) product.price = price;
  if (discountedPrice !== undefined) {
    if (Number(discountedPrice) === 0) {
      product.discountedPrice = null;
    } else {
      product.discountedPrice = discountedPrice;
    }
  }
  if (rating) product.rating = rating;
  if (reviews) product.reviews = reviews;
  if (image) product.image = image;

  await product.save();

  return ApiResponse(res, "Product updated successfully", product);

});

const deleteProduct = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Category id is required");
  }

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return ApiResponse(res, "Product deleted successfully", product);

});

export { addProduct, deleteProduct, getAllProducts, getProductById, getProductBySlug, updateProduct };

