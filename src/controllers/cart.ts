import { Response } from "express";
import mongoose from "mongoose";
import { Product } from "../models/product";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { tryCatch } from "../utils/tryCatch";
import { Cart } from "../models/cart";

const getMyCart = tryCatch(async (req: any, res: Response): Promise<any> => {

  let cart = await Cart.findOne({ user: req.user._id }).populate("products.product");

  if (!cart) {
    cart = await Cart.create({ user: req.user._id });
  }

  const products = cart.products
    .filter((item: any) => item.product) // guard against deleted/null product refs
    .map((item: any) => {
      const product = item.product;
      const effectivePrice = product.discountedPrice ?? product.price;
      const lineTotal = effectivePrice * item.quantity;

      return {
        _id: product._id,
        title: product.title,
        image: product.image,
        price: product.price,
        discountedPrice: product.discountedPrice,
        effectivePrice,
        quantity: item.quantity,
        lineTotal,
        inStock: product.inStock,
      };
    });

  const subtotal = products.reduce((sum: any, item: any) => sum + item.lineTotal, 0);
  const shipping = 0; // "Free" per the design; swap in real logic if needed
  const total = subtotal + shipping;

  const hasOutOfStockItems = products.some((item: any) => !item.inStock);

  const responseData = {
    _id: cart._id,
    user: cart.user,
    products,
    itemCount: products.length,
    subtotal,
    shipping,
    total,
    hasOutOfStockItems,
  };

  return ApiResponse(res, "Cart fetched successfully", responseData);
});

const addToCart = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { productId, quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
    throw new ApiError(400, "Invalid quantity");
  }

  const isProductExist = await Product.findById(productId);

  if (!isProductExist) {
    throw new ApiError(404, "Product not found");
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id });
  }

  const productInCart = cart.products.find(
    (item: any) => item.product.toString() === productId.toString()
  );

  if (productInCart) {
    productInCart.quantity += parseInt(quantity);
  } else {
    cart.products.push({ product: productId, quantity: parseInt(quantity) });
  }

  await cart.save();

  return ApiResponse(res, "Product added to Cart successfully", cart);

});

const updateCart = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { productId, quantity } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  let isFound = false;

  cart.products = cart.products.map((item: any) => {
    if (item.product.toString() === productId.toString()) {
      item.quantity = parseInt(quantity);
      isFound = true;
    }
    return item;
  });

  if (!isFound) {
    throw new ApiError(404, "Product not found in Cart");
  }

  await cart.save();

  return ApiResponse(res, "Product updated in Cart successfully", cart);

});

const deleteFromCart = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const initialLength = cart.products.length;

  cart.products = cart.products.filter(
    (item: any) => item.product.toString() !== productId.toString()
  );

  if (cart.products.length === initialLength) {
    throw new ApiError(400, "Product is not in the Cart");
  }

  await cart.save();

  return ApiResponse(res, "Product removed from Cart successfully", cart);

});

export { addToCart, updateCart, deleteFromCart, getMyCart };