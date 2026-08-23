import { Router } from "express";
import {
  addCategory,
  categoriesWithSubCategories,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory
} from "../controllers/category";
import { AllowOnly } from "../middlewares/allowOnly";
import { uploads } from "../utils/multer";

const categoryRouter = Router();

categoryRouter.route("/").get(getAllCategories);
categoryRouter.route("/with-subcategories").get(categoriesWithSubCategories);
categoryRouter.route("/:id").get(getCategoryById);
categoryRouter.route("/slug/:slug").get(getCategoryBySlug);

categoryRouter.route("/add").post(AllowOnly(["admin", "manager"]), uploads.categoryUpload, addCategory);
categoryRouter.route("/:id").put(AllowOnly(["admin", "manager"]), uploads.categoryUpload, updateCategory);
categoryRouter.route("/:id").delete(AllowOnly(["admin", "manager"]), deleteCategory);


export { categoryRouter };

