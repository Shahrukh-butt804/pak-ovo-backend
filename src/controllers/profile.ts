import { Response } from "express";
import { User } from "../models/user";
import { tryCatch } from "../utils/tryCatch";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { Order } from "../models/order";
import { Wishlist } from "../models/wishlist";

const getMyProfile = tryCatch(async (req: any, res: Response): Promise<any> => {

  const [ordersCount, wishlist]: any = await Promise.all([
    Order.countDocuments({ user: req.user._id }),
    Wishlist.findOne({ user: req.user._id }).select("products").lean(),
  ]);

  const wishlistCount = wishlist?.products?.length ?? 0;

  const profile = {
    ...req.user.toObject(),
    ordersCount,
    wishlistCount,
  };

  return ApiResponse(res, "User profile fetched successfully", profile);
});

const updateProfile = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { fullName } = req.body;
  // const image = req?.files && req?.files?.image ? req?.files?.image[0]?.path : null;

  const updateDate: any = {}

  if (fullName) {
    updateDate.fullName = fullName
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: updateDate
    },
    {
      new: true,
    },
  );

  if (!user) {
    throw new ApiError(500, "Failed to update profile");
  }

  return ApiResponse(res, "Profile updated successfully", user);

});

const deleteMyProfile = tryCatch(async (req: any, res: Response): Promise<any> => {
  const user = req.user;

  if (user.role === "admin") {
    throw new ApiError(403, "Unauthorized to delete profile");
  }

  const deletedUser = await User.findByIdAndDelete(user._id);

  if (!deletedUser) {
    throw new ApiError(404, "User not found");
  }

  return ApiResponse(res, "User deleted successfully");

});

export { getMyProfile, updateProfile, deleteMyProfile };
