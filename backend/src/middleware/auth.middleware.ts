import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";
import { AuthRequest } from "../types/index.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "super-secret-key-change-me";

interface JwtPayload {
  userId: string;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized. Token missing or invalid." });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: "Unauthorized. User not found." });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized. Token verification failed." });
  }
};
