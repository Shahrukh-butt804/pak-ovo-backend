import { Router } from "express";
import { addSubCategory, deleteSubCategories, getAllSubCategories, getSubCategoryById, updateSubCategories } from "../controllers/subcategory";
import { AllowOnly } from "../middlewares/allowOnly";
import { verifyJWT } from "../middlewares/auth.middleware";

const subCategoryRouter = Router();

subCategoryRouter.route("/").get(verifyJWT, getAllSubCategories);
subCategoryRouter.route("/:id").get(verifyJWT, getSubCategoryById);

subCategoryRouter.route("/add").post(AllowOnly(["admin", "manager"]), addSubCategory);
subCategoryRouter.route("/:id").put(AllowOnly(["admin", "manager"]), updateSubCategories);
subCategoryRouter.route("/:id").delete(AllowOnly(["admin", "manager"]), deleteSubCategories);


export { subCategoryRouter };