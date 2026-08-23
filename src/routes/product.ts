import { Router } from "express";
import { addProduct, deleteProduct, getAllProducts, getProductById, getProductBySlug, updateProduct } from "../controllers/product";
import { AllowOnly } from "../middlewares/allowOnly";
import { optionalJWT } from "../middlewares/auth.middleware";
import { uploads } from "../utils/multer";
import { updateProductValidation } from "../validations/product.update.validation";
import { addProductValidation } from "../validations/product.validation";
import { handleValidationErrors } from "../validations/user.validation";

const productRouter = Router();

productRouter.route("/").get(optionalJWT, getAllProducts);
productRouter.route("/:id").get(getProductById);
productRouter.route("/slug/:slug").get(getProductBySlug);
productRouter.route("/add").post(AllowOnly(["admin", "manager"]), uploads.productUpload, addProductValidation, handleValidationErrors, addProduct);
productRouter.route("/:id").put(AllowOnly(["admin", "manager"]), uploads.productUpload, updateProductValidation, handleValidationErrors, updateProduct);
productRouter.route("/:id").delete(AllowOnly(["admin", "manager"]), deleteProduct);



export { productRouter };
