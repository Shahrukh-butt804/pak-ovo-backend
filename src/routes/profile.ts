import { Router } from "express";
import {
  deleteMyProfile,
  getMyProfile,
  updateProfile
} from "../controllers/profile";
import { verifyJWT } from "../middlewares/auth.middleware";

const profileRouter = Router();

profileRouter.route("/my-profile").get(verifyJWT, getMyProfile);
profileRouter.route("/update-profile").put(verifyJWT, updateProfile);
profileRouter.route("/").delete(verifyJWT, deleteMyProfile);


export { profileRouter };

