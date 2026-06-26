import { Response, NextFunction } from "express";
import { prisma } from "../prisma.js";
import { AuthRequest } from "../types/index.js";

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // req.user is already populated by the requireAuth middleware
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized. User profile not loaded." });
      return;
    }

    res.json(req.user);
  } catch (error) {
    next(error);
  }
};