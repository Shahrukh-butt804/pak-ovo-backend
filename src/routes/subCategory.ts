import { Router } from "express";
import { addSubCategory, deleteSubCategories, getAllSubCategories, getSubCategoryById, updateSubCategories } from "../controllers/subcategory";
import { AllowOnly } from "../middlewares/allowOnly";
import { verifyJWT } from "../middlewares/auth.middleware";

const subCategoryRouter = Router();

subCategoryRouter.route("/").get(verifyJWT, getAllSubCategories);
subCategoryRouter.route("/:id").get(verifyJWT, getSubCategoryById);

subCategoryRouter.route("/add").post(AllowOnly("admin"), addSubCategory);
subCategoryRouter.route("/:id").put(AllowOnly("admin"), updateSubCategories);
subCategoryRouter.route("/:id").delete(AllowOnly("admin"), deleteSubCategories);


export { subCategoryRouter };