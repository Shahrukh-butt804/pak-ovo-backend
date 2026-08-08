// controllers/route.controller.ts
import { Response } from "express";
import { tryCatch } from "../utils/tryCatch";
import { ApiResponse } from "../utils/apiResponse";
import { Route } from "../models/routes";
import { ApiError } from "../utils/apiError";
import { User } from "../models/user";

const CAMEL_CASE_REGEX = /^[a-z][a-z0-9]*([A-Z][a-z0-9]*)*$/;

export const getAllRoutes = tryCatch(async (req: any, res: Response): Promise<any> => {
  const routes = await Route.find().sort({ name: 1 });
  return ApiResponse(res, "Routes fetched successfully", routes);
});

export const addRoute = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, "Route name is required");
  }

  const trimmedName = name.trim();

  if (!CAMEL_CASE_REGEX.test(trimmedName)) {
    throw new ApiError(400, "Route name must be in camelCase (e.g. customerSupport)");
  }

  const existing = await Route.findOne({ name: trimmedName });
  if (existing) {
    throw new ApiError(409, "A route with this name already exists");
  }

  const route = await Route.create({ name: trimmedName });

  return ApiResponse(res, "Route added successfully", route);
});

export const updateRoute = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, "Route name is required");
  }

  const trimmedName = name.trim();

  if (!CAMEL_CASE_REGEX.test(trimmedName)) {
    throw new ApiError(400, "Route name must be in camelCase (e.g. customerSupport)");
  }

  const route = await Route.findById(id);
  if (!route) {
    throw new ApiError(404, "Route not found");
  }

  const existing = await Route.findOne({ name: trimmedName, _id: { $ne: id } });

  if (existing) {
    throw new ApiError(409, "A route with this name already exists");
  }

  route.name = trimmedName;
  await route.save();

  return ApiResponse(res, "Route updated successfully", route);
});

// DELETE /routes/:id
export const deleteRoute = tryCatch(async (req: any, res: Response): Promise<any> => {
  const { id } = req.params;

  const route = await Route.findById(id);
  if (!route) {
    throw new ApiError(404, "Route not found");
  }

  await route.deleteOne();

  // Remove this route from any manager who had it assigned
  await User.updateMany(
    { assignedRoutes: id },
    { $pull: { assignedRoutes: id } }
  );

  return ApiResponse(res, "Route deleted successfully", { _id: id });
});
