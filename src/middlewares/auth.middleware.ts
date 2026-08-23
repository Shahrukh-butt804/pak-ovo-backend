import jwt, { JwtPayload } from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { User } from "../models/user";
import { tryCatch } from "../utils/tryCatch";

export const verifyJWT = tryCatch(
  async (req: any, res: Response, next: NextFunction): Promise<any> => {
    try {
      const token: string | undefined =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized request",
        });
      }

      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string,
      ) as JwtPayload;

      if (!decodedToken || !decodedToken._id) {
        return res.status(401).json({
          success: false,
          message: "Invalid Access Token",
        });
      }

      const user: any = await User.findById(decodedToken._id).select(
        "-password -refreshToken -otp",
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid Access Token",
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "This account is deactivated",
        });
      }

      req.user = user; // Now TypeScript recognizes this
      next();
    } catch (error: any) {
      console.error(error);
      return res.status(401).json({
        success: false,
        message: error?.message || "Invalid Access Token",
      });
    }
  },
);

export const optionalJWT = tryCatch(
  async (req: any, res: Response, next: NextFunction): Promise<any> => {
    try {
      const token: string | undefined =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

      // No token = guest user
      if (!token) {
        req.user = null;
        return next();
      }

      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string,
      ) as JwtPayload;

      if (!decodedToken?._id) {
        req.user = null;
        return next();
      }

      const user: any = await User.findById(decodedToken._id).select(
        "-password -refreshToken -otp",
      );

      // User doesn't exist
      if (!user) {
        req.user = null;
        return next();
      }

      // Account is deactivated
      if (!user.isActive) {
        req.user = null;
        return next();
      }

      // Authenticated user
      req.user = user;
      next();
    } catch (error) {
      // Invalid/expired token = treat as guest
      req.user = null;
      next();
    }
  },
);