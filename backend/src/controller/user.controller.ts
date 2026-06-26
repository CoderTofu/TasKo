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

export const updateMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized. User profile not loaded." });
      return;
    }

    const { name, email } = req.body;

    // =========================================================================
    // EXERCISE TODO: Complete the update profile logic
    //
    // Guidelines:
    // 1. You should update the user in the database using `prisma.user.update`.
    //    Use `req.user.id` as the unique selector.
    // 2. Allow updating both `name` and `email`. Note: if updating the email,
    //    ensure you handle validation or potential conflicts if the new email
    //    is already taken (optional, but a great learning check!).
    // 3. Select the fields you want to return (e.g. do not return the password hash).
    // 4. Return the updated user object with a 200 Status code.
    // =========================================================================

    // Remove or comment out this block when you start implementing the updateMe function
    res.status(501).json({
      message: "TODO: Implement updateMe logic! Follow the comments in src/controller/user.controller.ts",
    });
  } catch (error) {
    next(error);
  }
};
