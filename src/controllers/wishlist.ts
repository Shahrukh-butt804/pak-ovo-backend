import { Response } from "express";
import mongoose from "mongoose";
import { Product } from "../models/product";
import { Wishlist } from "../models/wishlist";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { tryCatch } from "../utils/tryCatch";

const getMyWishlist = tryCatch(async (req: any, res: Response): Promise<any> => {

  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id });
  }

  return ApiResponse(res, "User wishlist fetched successfully", wishlist);
});

const addToWishlist = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const isProductExist = await Product.findById(productId);

  if (!isProductExist) {
    throw new ApiError(404, "Product not found");
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id });
  }

  const isProductInWishlist = wishlist.products.includes(productId);

  if (isProductInWishlist) {
    throw new ApiError(400, "Product is already in the wishlist");
  }

  wishlist.products.push(productId);
  await wishlist.save();

  return ApiResponse(res, "Product added to wishlist successfully", wishlist);

});

const deleteFromWishlist = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  const isProductInWishlist = wishlist.products.includes(productId);

  if (!isProductInWishlist) {
    throw new ApiError(400, "Product is not in the wishlist");
  }

  wishlist.products = wishlist.products.filter((id: any) => id.toString() !== productId.toString());
  await wishlist.save();

  return ApiResponse(res, "Product removed from wishlist successfully", wishlist);

});

export { addToWishlist, deleteFromWishlist, getMyWishlist };

