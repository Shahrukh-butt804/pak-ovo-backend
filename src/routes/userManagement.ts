import { Router } from "express";
import { getAllUsers, getUserById, toggleUserStatus } from "../controllers/userManagement";
import { AllowOnly } from "../middlewares/allowOnly";

const userManagementRouter = Router();

userManagementRouter.route("/").get(AllowOnly(["admin", "manager"]), getAllUsers);
userManagementRouter.route("/:id").get(AllowOnly(["admin", "manager"]), getUserById);
userManagementRouter.route("/toggle-status/:id").put(AllowOnly(["admin", "manager"]), toggleUserStatus);


export { userManagementRouter };

