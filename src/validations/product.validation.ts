import { body, ValidationChain } from "express-validator";
import mongoose from "mongoose";
import { Category } from "../models/category"; // adjust path as needed
import { SubCategory } from "../models/subcategory";

export const addProductValidation: ValidationChain[] = [
  body("category")
    .notEmpty().withMessage("Category is required")
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Category must be a valid Mongo ID")
    .bail()
    .custom(async (value) => {
      const exists = await Category.exists({ _id: value });
      if (!exists) {
        throw new Error("Category does not exist");
      }
      return true;
    }),
  body("subCategory")
    .notEmpty().withMessage("subategory, is required")
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Category must be a valid Mongo ID")
    .bail()
    .custom(async (value) => {
      const exists = await SubCategory.exists({ _id: value });
      if (!exists) {
        throw new Error("sub Category does not exist");
      }
      return true;
    }),

  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 2, max: 300 }).withMessage("Title must be between 2 and 300 characters"),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required")
    .isLength({ max: 3000 }).withMessage("Description must be under 3000 characters"),

  body("price")
    .notEmpty().withMessage("Price is required")
    .bail()
    .isFloat({ gt: 0 }).withMessage("Price must be a number greater than 0"),

  body("discountedPrice")
    .optional({ nullable: true })
    .custom((value, { req }) => {
      if (req.body.price && Number(value) >= Number(req.body.price)) {
        throw new Error("Discounted price must be less than the actual price");
      }
      return true;
    }),

  body("rating")
    .trim()
    .notEmpty().withMessage("Rating is required")
    .isFloat({ min: 0, max: 5 }).withMessage("Rating must be between 0 and 5"),

  body("reviews")
    .trim()
    .notEmpty().withMessage("Reviews is required")
    .isInt({ min: 0 }).withMessage("Reviews must be a non-negative integer"),

  body("metaTitle")
    .trim()
    .notEmpty().withMessage("Meta title is required")
    .isLength({ max: 300 }).withMessage("Meta title must be under 300 characters"),

  body("metaDescription")
    .trim()
    .notEmpty().withMessage("Meta description is required")
    .isLength({ max: 3000 }).withMessage("Meta description must be under 3000 characters"),


];