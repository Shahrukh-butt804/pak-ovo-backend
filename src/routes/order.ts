import { Router } from "express";
import { createOrder, getAllOrder, getOrderById, getMyOrders, getStripeKeys, updateOrderStatus } from "../controllers/order";
import { verifyJWT } from "../middlewares/auth.middleware";
import { validateOrder } from "../validations/order.validation";
import { handleValidationErrors } from "../validations/user.validation";
import { AllowOnly } from "../middlewares/allowOnly";

const orderRouter = Router();

orderRouter.route("/get-stripe-keys").get(getStripeKeys);
orderRouter.route("/create-order").post(
  // validateOrder, handleValidationErrors,
  verifyJWT, createOrder);
orderRouter.route("/").get(AllowOnly("admin"), getAllOrder);
orderRouter.route("/by-id/:id").get(getOrderById);
orderRouter.route("/my-orders").get(verifyJWT, getMyOrders);
orderRouter.route("/:id").put(AllowOnly("admin"), updateOrderStatus);

export { orderRouter };
