import { body, param, ValidationChain } from "express-validator";
import mongoose from "mongoose";
import { Category } from "../models/category";
import { Product } from "../models/product";
import { SubCategory } from "../models/subcategory";

export const updateProductValidation: ValidationChain[] = [
  param("id")
    .notEmpty().withMessage("Product ID is required")
    .bail()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Product ID must be a valid Mongo ID")
    .bail()
    .custom(async (value) => {
      const exists = await Product.exists({ _id: value });
      if (!exists) {
        throw new Error("Product not found");
      }
      return true;
    }),

  body("category")
    .optional({ nullable: true })
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
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage("Title must be between 2 and 150 characters"),

  body("description")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 }).withMessage("Description must be under 2000 characters"),

  body("price")
    .optional({ nullable: true })
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
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 5 }).withMessage("Rating must be between 0 and 5"),

  body("reviews")
    .optional({ nullable: true })
    .isInt({ min: 0 }).withMessage("Reviews must be a non-negative integer"),
];