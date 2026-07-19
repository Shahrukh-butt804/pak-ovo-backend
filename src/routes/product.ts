import { Router } from "express";
import { addProduct, deleteProduct, getAllProducts, getProductById, getProductBySlug, updateProduct } from "../controllers/product";
import { AllowOnly } from "../middlewares/allowOnly";
import { verifyJWT } from "../middlewares/auth.middleware";
import { uploads } from "../utils/multer";
import { addProductValidation } from "../validations/product.validation";
import { handleValidationErrors } from "../validations/user.validation";
import { updateProductValidation } from "../validations/product.update.validation";

const productRouter = Router();

productRouter.route("/").get(verifyJWT, getAllProducts);
productRouter.route("/:id").get(verifyJWT, getProductById);
productRouter.route("/slug/:slug").get(verifyJWT, getProductBySlug);
productRouter.route("/add").post(AllowOnly("admin"), uploads.productUpload, addProductValidation, handleValidationErrors, addProduct);
productRouter.route("/:id").put(AllowOnly("admin"), uploads.productUpload, updateProductValidation, handleValidationErrors, updateProduct);
productRouter.route("/:id").delete(AllowOnly("admin"), deleteProduct);



export { productRouter };