import { Router } from "express";
import { assignManagerRoutes, changeUserRole, getAllUsers, getDashboardReport, getUserById, toggleUserStatus } from "../controllers/userManagement";
import { AllowOnly } from "../middlewares/allowOnly";

const userManagementRouter = Router();

userManagementRouter.route("/").get(AllowOnly(["admin", "manager"]), getAllUsers);
userManagementRouter.route("/dashboard-report").get(AllowOnly(["admin", "manager"]), getDashboardReport);
userManagementRouter.route("/:id").get(AllowOnly(["admin", "manager"]), getUserById);
userManagementRouter.route("/toggle-status/:id").put(AllowOnly(["admin", "manager"]), toggleUserStatus);
userManagementRouter.route("/assign-routes/:id").put(AllowOnly(["admin", "manager"]), assignManagerRoutes);
userManagementRouter.route("/change-role/:id").put(AllowOnly(["admin", "manager"]), changeUserRole);


export { userManagementRouter };

