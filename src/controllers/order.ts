import dotenv from "dotenv";
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });

import { Response } from "express";
import mongoose from "mongoose";
import Stripe from "stripe";
import { Cart } from "../models/cart";
import { Order } from "../models/order";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { makeStripePayment } from "../utils/stripePayment";
import { tryCatch } from "../utils/tryCatch";


interface CartProductItem {
  product: {
    price: number;
    discountedPrice?: number | null;
    inStock: boolean;
  };
  quantity: number;
}

interface CartLike {
  products: CartProductItem[];
}

export const calculateCartTotal = (cart: CartLike): number => {
  let total = 0;

  for (const item of cart.products) {
    const product = item.product;

    if (!product) {
      throw new ApiError(400, "One or more products in the cart no longer exist");
    }

    if (!product.inStock) {
      throw new ApiError(400, "One or more products in the cart are out of stock");
    }

    const effectivePrice = product.discountedPrice ?? product.price;
    total += effectivePrice * item.quantity;
  }

  return total;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const getStripeKeys = tryCatch(async (req: any, res: Response): Promise<any> => {
  return res.status(200).json({
    message: "Stripe keys fetched successfully!",
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});


const createOrder = tryCatch(async (req: any, res: Response): Promise<any> => {
  const {
    email,
    phone,
    shippingAddress,
    // token,
  } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("products.product");

  if (!cart || cart.products.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const cartTotal = calculateCartTotal(cart);
  console.log("🚀 ~ cartTotal:", cartTotal)

  // const { status, message, charge } = await makeStripePayment({
  //   token,
  //   amount: cartTotal,
  //   description: `Order for ${req.user.email}`,
  //   user: req.user,
  // });

  // if (!status) {
  //   return ApiResponse(res, message, null, 400);
  // }

  const order = await Order.create({
    user: req.user._id,
    email,
    phone,
    shippingAddress,
    products: cart.products.map((item: any) => ({
      product: item.product._id,
      quantity: item.quantity,
      effectivePrice: item.product.discountedPrice ?? item.product.price,
    })),
    totalAmount: cartTotal,
    // stripeSource: token,
    // metaData: charge,
    metaData: {},
  });


  await Cart.findOneAndUpdate({ user: req.user._id }, { products: [] });

  return ApiResponse(res, "Order created successfully", order, 200);

});

const getAllOrder = tryCatch(async (req: any, res: Response): Promise<any> => {

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const keyword = req.query.keyword || "";

  const aggregate = Order.aggregate([
    {
      $match: {
        ...(keyword ? { status: { $regex: keyword, $options: "i" } } : {}),
        ...(keyword ? { email: { $regex: keyword, $options: "i" } } : {})
      }
    },
    { $sort: { createdAt: -1 } },
  ]);

  const options = { page, limit };

  const result = await (Order as any).aggregatePaginate(aggregate, options);

  return ApiResponse(res, "Orders fetched successfully", result, 200);
});

const getOrderById = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid order id");
  }

  const order = await Order.findById(id).populate("user").populate({ path: "products.product" })

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return ApiResponse(res, "Order fetched successfully", order, 200);

});

const getMyOrders = tryCatch(async (req: any, res: Response): Promise<any> => {

  const orders = await Order.find({ user: req.user._id }).populate("products.product").sort({ createdAt: -1 });


  return ApiResponse(res, "Orders fetched successfully", orders, 200);

});

const updateOrderStatus = tryCatch(async (req: any, res: Response): Promise<any> => {

  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["confirmed", "dispatched", "delivered", "cancelled"];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const order = await Order.findById(id);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status == status) {
    throw new ApiError(400, `Order status is already ${status}`);
  }

  if (order.status == "delivered" && status == "cancelled") {
    throw new ApiError(400, "Delivered order cannot be cancelled");
  }

  if (order.status === "cancelled") {
    throw new ApiError(400, "Cancelled order cannot change status");
  }

  if (order.status === "delivered" && (status == "dispatched" || status == "confirmed" || status == "pending")) {
    throw new ApiError(400, `Delivered order cannot revert back to ${status}`);
  }

  if (order.status === "dispatched" && (status === "confirmed")) {
    throw new ApiError(400, `Dispatched order cannot revert back to ${status}`);
  }

  order.status = status;
  await order.save();

  return ApiResponse(res, "Order status updated successfully", order, 200);

})


export {
  createOrder, getAllOrder,
  getOrderById, getMyOrders, getStripeKeys, updateOrderStatus
};

