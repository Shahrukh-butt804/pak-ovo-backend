import { Response } from "express";
import mongoose from "mongoose";
import { Order } from "../models/order";
import { Product } from "../models/product";
import { Route } from "../models/routes";
import { User } from "../models/user";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { tryCatch } from "../utils/tryCatch";

const getDashboardReport = tryCatch(async (req: any, res: Response): Promise<any> => {
  const [summary] = await Order.aggregate([
    {
      $group: {
        _id: null,
        revenue: { $sum: "$totalAmount" },
        totalOrders: { $sum: 1 },
        customers: { $addToSet: "$user" },
      },
    },
    {
      $project: {
        _id: 0,
        revenue: 1,
        totalOrders: 1,
        customers: { $size: "$customers" },
      },
    },
  ]);

  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });

  const recentOrders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select("shippingAddress totalAmount status createdAt")
    .lean();

  const formattedRecentOrders = recentOrders.map((order: any) => ({
    orderId: `PKO-${order._id.toString().slice(-4).toUpperCase()}`,
    customer: `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim(),
    total: order.totalAmount,
    status: order.status,
  }));

  return res.status(200).json({
    success: true,
    data: {
      revenue: summary?.revenue || 0,
      totalOrders: summary?.totalOrders || 0,
      customers: totalUsers || 0,
      totalProducts,
      recentOrders: formattedRecentOrders,
    },
  });
});

const getAllUsers = tryCatch(async (req: any, res: Response): Promise<any> => {

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const keyword = req.query.keyword || "";
  const role = req.query.role;


  const aggregate = User.aggregate([
    { $match: { ...(role ? { role } : { role: { $ne: "admin" } }), ...(keyword ? { fullName: { $regex: keyword, $options: "i" } } : {}) } },
    { $sort: { createdAt: -1 } },
  ]);

  const options = { page, limit };

  const result = await (User as any).aggregatePaginate(aggregate, options);

  return ApiResponse(res, "Users fetched successfully", result, 200);
});

const getUserById = tryCatch(async (req: any, res: Response): Promise<any> => {

  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("User id is required");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return ApiResponse(res, "User fetched successfully", user);

});

const toggleUserStatus = tryCatch(async (req: any, res: Response): Promise<any> => {

  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("User id is required");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    throw new Error("Admin users cannot be deactivated");
  }

  user.isActive = !user.isActive;
  await user.save();


  return ApiResponse(res, `User ${user.isActive ? "activated" : "deactivated"} successfully`, user, 200);


})

const changeUserRole = tryCatch(async (req: any, res: Response): Promise<any> => {

  const { id } = req.params;
  const { role } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("User id is required");
  }

  if (!role || !["user", "manager"].includes(role)) {
    throw new ApiError(400, "Invalid role provided");
  }

  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === "admin") {
    throw new ApiError(400, "Admin users cannot have their role changed");
  }

  user.role = role;
  await user.save();

  return ApiResponse(res, "User role updated successfully", user, 200);
})

const assignManagerRoutes = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { id } = req.params;
  const { routes } = req.body;

  if (!Array.isArray(routes)) {
    throw new ApiError(400, "Routes must be an array of route IDs");
  }

  const manager = await User.findById(id);
  if (!manager) {
    throw new ApiError(404, "Manager not found");
  }

  if (manager.role !== "manager") {
    throw new ApiError(400, "Routes can only be assigned to managers");
  }

  if (routes.length > 0) {
    const validRoutes = await Route.find({ _id: { $in: routes } });
    if (validRoutes.length !== routes.length) {
      throw new ApiError(400, "One or more route IDs are invalid");
    }
  }

  manager.assignedRoutes = routes;
  await manager.save();

  const populatedManager = await User.findById(id)
    .select("-password -refreshToken -otp")
    .populate("assignedRoutes", "name");

  return ApiResponse(res, "Manager routes updated successfully", populatedManager);
});


export { getDashboardReport, assignManagerRoutes, changeUserRole, getAllUsers, getUserById, toggleUserStatus };

