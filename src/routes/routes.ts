import { Router } from "express";
import { addRoute, deleteRoute, getAllRoutes, updateRoute } from "../controllers/route";
import { AllowOnly } from "../middlewares/allowOnly";

const routerRouter = Router();

routerRouter.get("/", AllowOnly(["admin"]), getAllRoutes);
routerRouter.post("/", AllowOnly(["admin"]), addRoute);
routerRouter.patch("/:id", AllowOnly(["admin"]), updateRoute);
routerRouter.delete("/:id", AllowOnly(["admin"]), deleteRoute);

export { routerRouter };