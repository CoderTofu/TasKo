import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "super-secret-key-change-me";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: "A user with this email already exists." });
      return;
    }

    // Hash the password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in the database
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return the response (omit password from returned data)
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }

    const user = await prisma.user.findUnique(
      {where: {email}}
    )

    if (!user || !user.password) {
      res.status(401).json({error: "Invalid email or password"})
      return
    }

    const isPasswordValid = await bcrypt.compare(password, user?.password);

    if (!isPasswordValid) {
      res.status(401).json({error: "Invalid email or password"})
      return
    }

    const token = jwt.sign({userId: user.id}, JWT_SECRET, {expiresIn: "3d"})
    res.status(200).json({token, user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }})
  } catch (error) {
    next(error);
  }
};
