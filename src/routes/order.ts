import { Router } from "express";
import { createOrder, getAllOrder, getMyOrders, getOrderById, getStripeKeys, updateOrderStatus } from "../controllers/order";
import { AllowOnly } from "../middlewares/allowOnly";
import { verifyJWT } from "../middlewares/auth.middleware";
import { validateOrder } from "../validations/order.validation";
import { handleValidationErrors } from "../validations/user.validation";

const orderRouter = Router();

orderRouter.route("/get-stripe-keys").get(getStripeKeys);
orderRouter.route("/create-order").post(validateOrder, handleValidationErrors, verifyJWT, createOrder);
orderRouter.route("/").get(AllowOnly(["admin", "manager"]), getAllOrder);
orderRouter.route("/by-id/:id").get(getOrderById);
orderRouter.route("/my-orders").get(verifyJWT, getMyOrders);
orderRouter.route("/:id").put(AllowOnly(["admin", "manager"]), updateOrderStatus);

export { orderRouter };

