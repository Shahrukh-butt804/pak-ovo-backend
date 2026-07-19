import { Response } from "express";
import mongoose from "mongoose";
import { SubCategory } from "../models/subcategory";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { tryCatch } from "../utils/tryCatch";
import { createSlug } from "../utils/createSlug";

const getAllSubCategories = tryCatch(async (req: any, res: Response): Promise<any> => {

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const keyword = req.query.keyword || "";
  const slug = req.query.slug || ""


  const aggregate = SubCategory.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    {
      $match: {
        ...(keyword ? { name: { $regex: keyword, $options: "i" } } : {}),
        ...(slug ? { "category.slug": slug } : {}),
      }
    },
    { $sort: { createdAt: -1 } },
  ]);

  const options = { page, limit };

  const result = await (SubCategory as any).aggregatePaginate(aggregate, options);

  return ApiResponse(res, "Sub Categories fetched successfully", result, 200);


});

const getSubCategoryById = tryCatch(async (req: any, res: Response): Promise<any> => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Sub Categories id is invalid");
  }

  const subCategory = await SubCategory.findById(id);

  if (!subCategory) {
    throw new ApiError(404, "Sub Categories not found");
  }

  return ApiResponse(res, "SubCategory fetched successfully", subCategory);

});

const addSubCategory = tryCatch(async (req: any, res: Response): Promise<any> => {

  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "Sub Category name is required");
  }

  const subCategory = await SubCategory.create({ name, slug: createSlug(name) });

  return ApiResponse(res, "Sub Category added successfully", subCategory);

});

const updateSubCategories = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { id } = req.params;
  const { name } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "SubCategories id is required");
  }

  const updateData: any = {}

  if (name) {
    updateData.name = name
    updateData.slug = createSlug(name)
  }

  const subCategory = await SubCategory.findByIdAndUpdate(
    id,
    {
      $set: updateData
    },
    {
      new: true,
    },
  );

  if (!subCategory) {
    throw new ApiError(500, "Failed to update subCategory");
  }

  return ApiResponse(res, "subCategory updated successfully", subCategory);

});

const deleteSubCategories = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "subCategory id is Invalid");
  }

  const subCategory = await SubCategory.findByIdAndDelete(id);

  if (!subCategory) {
    throw new ApiError(404, "sub Category not found");
  }

  return ApiResponse(res, "sub Category deleted successfully", subCategory);

});

export { getAllSubCategories, getSubCategoryById, addSubCategory, updateSubCategories, deleteSubCategories };

