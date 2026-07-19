import { Router } from "express";
import { addToCart, deleteFromCart, getMyCart, updateCart } from "../controllers/cart";
import { verifyJWT } from "../middlewares/auth.middleware";

const cartRouter = Router();

cartRouter.route("/").get(verifyJWT, getMyCart);
cartRouter.route("/add-product").post(verifyJWT, addToCart);
cartRouter.route("/update-product").put(verifyJWT, updateCart);
cartRouter.route("/delete-product/:productId").delete(verifyJWT, deleteFromCart);


export { cartRouter };

