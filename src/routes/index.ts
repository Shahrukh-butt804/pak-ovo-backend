import express from "express";
import { authRouter } from "./auth";
import { profileRouter } from "./profile";
import { userManagementRouter } from "./userManagement";
import { wishlistRouter } from "./wishlist";
import { cartRouter } from "./cart";
import { categoryRouter } from "./category";
import { productRouter } from "./product";
import { orderRouter } from "./order";
import { subCategoryRouter } from "./subCategory";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/user-management", userManagementRouter);

router.use("/wishlist", wishlistRouter);
router.use("/cart", cartRouter);
router.use("/category", categoryRouter);
router.use("/sub-category", subCategoryRouter);
router.use("/product", productRouter);
router.use("/order", orderRouter);

export { router };
