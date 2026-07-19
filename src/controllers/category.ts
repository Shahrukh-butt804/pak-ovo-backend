import { Response } from "express";
import mongoose from "mongoose";
import { Category } from "../models/category";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { tryCatch } from "../utils/tryCatch";
import { createSlug } from "../utils/createSlug";
import { SubCategory } from "../models/subcategory";

const getAllCategories = tryCatch(async (req: any, res: Response): Promise<any> => {

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const keyword = req.query.keyword || "";


  const aggregate = Category.aggregate([
    { $match: { ...(keyword ? { name: { $regex: keyword, $options: "i" } } : {}) } },
    { $sort: { createdAt: -1 } },
  ]);

  const options = { page, limit };

  const result = await (Category as any).aggregatePaginate(aggregate, options);

  return ApiResponse(res, "Category fetched successfully", result, 200);


});

const categoriesWithSubCategories = tryCatch(async (req: any, res: Response): Promise<any> => {

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const keyword = req.query.keyword || "";

  const aggregate = Category.aggregate([
    { $match: { ...(keyword ? { name: { $regex: keyword, $options: "i" } } : {}) } },
    {
      $lookup: {
        from: "subcategories",
        localField: "_id",
        foreignField: "category",
        as: "subCategories",
        pipeline: [
          { $project: { name: 1, slug: 1 } },
        ],
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  const options = { page, limit };

  const result = await (Category as any).aggregatePaginate(aggregate, options);

  return ApiResponse(res, "Category fetched successfully", result, 200);

});

const getCategoryById = tryCatch(async (req: any, res: Response): Promise<any> => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Category id is required");
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return ApiResponse(res, "Category fetched successfully", category);

});

const getCategoryBySlug = tryCatch(async (req: any, res: Response): Promise<any> => {

  const { slug } = req.params;

  const category = await Category.findOne({ slug });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return ApiResponse(res, "Category fetched successfully", category);

});

const addCategory = tryCatch(async (req: any, res: Response): Promise<any> => {

  const { name, description, subCategories } = req.body;
  const image = req?.files && req?.files?.image ? req?.files?.image[0]?.path : null;
  const parsedListOfSubCategoryies = JSON.parse(subCategories)

  if (!parsedListOfSubCategoryies || parsedListOfSubCategoryies.length === 0) {
    throw new ApiError(400, "atleas one Sub Category is required");
  }

  if (!image) {
    throw new ApiError(400, "Category image is required");
  }

  if (!name) {
    throw new ApiError(400, "Category name is required");
  }

  if (!description) {
    throw new ApiError(400, "Description is required");
  }

  const category = await Category.create({ name, description, image, slug: createSlug(name) });

  await Promise.all(
    parsedListOfSubCategoryies.map((name: any) =>
      SubCategory.create({ category: category._id, name, slug: createSlug(name) })
    )
  );

  return ApiResponse(res, "Category added successfully", category);

});

const updateCategory = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { id } = req.params;
  const { name, description, subCategories } = req.body;
  const image = req?.files && req?.files?.image ? req?.files?.image[0]?.path : null;
  const parsedListOfSubCategoryies = JSON.parse(subCategories)

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid Category id");
  }

  const updateData: any = {}

  if (name) {
    updateData.name = name
    updateData.slug = createSlug(name)
  }
  if (image) {
    updateData.image = image
  }
  if (description) {
    updateData.description = description
  }

  if (parsedListOfSubCategoryies.length > 0) {
    const existingSubCategories = await SubCategory.find({ category: id });

    const existingNames = existingSubCategories.map((sc: any) => sc.name);
    const incomingNames = parsedListOfSubCategoryies;

    // names to add: in incoming but not in existing
    const namesToAdd = incomingNames.filter((name: string) => !existingNames.includes(name));

    // subcategories to remove: in existing but not in incoming
    const subCategoriesToRemove = existingSubCategories.filter(
      (sc: any) => !incomingNames.includes(sc.name)
    );

    // create new ones
    if (namesToAdd.length > 0) {
      await Promise.all(
        namesToAdd.map((name: string) =>
          SubCategory.create({ category: id, name, slug: createSlug(name) })
        )
      );
    }

    // remove ones no longer present
    if (subCategoriesToRemove.length > 0) {
      const idsToRemove = subCategoriesToRemove.map((sc: any) => sc._id);
      await SubCategory.deleteMany({ _id: { $in: idsToRemove } });
    }
  }

  const category = await Category.findByIdAndUpdate(
    id,
    {
      $set: updateData
    },
    {
      new: true,
    },
  );

  if (!category) {
    throw new ApiError(500, "Failed to update Category");
  }

  return ApiResponse(res, "Category updated successfully", category);

});

const deleteCategory = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Category id is required");
  }

  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return ApiResponse(res, "Category deleted successfully", category);

});

export { addCategory, deleteCategory, getCategoryById, getCategoryBySlug, getAllCategories, categoriesWithSubCategories, updateCategory };

