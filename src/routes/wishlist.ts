import { Router } from "express";
import { addToWishlist, deleteFromWishlist, getMyWishlist } from "../controllers/wishlist";
import { verifyJWT } from "../middlewares/auth.middleware";

const wishlistRouter = Router();

wishlistRouter.route("/").get(verifyJWT, getMyWishlist);
wishlistRouter.route("/add-product/:productId").post(verifyJWT, addToWishlist);
wishlistRouter.route("/delete-product/:productId").delete(verifyJWT, deleteFromWishlist);


export { wishlistRouter };