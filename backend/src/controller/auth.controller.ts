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

    // =========================================================================
    // EXERCISE TODO: Complete the login function
    // 
    // Guidelines to implement this:
    // 1. Look up the user by email using prisma.user.findUnique.
    // 2. If the user doesn't exist, return a 401 response (e.g. "Invalid email or password").
    // 3. Compare the provided password with the stored password hash using `bcrypt.compare`.
    //    Hint: `const isPasswordValid = await bcrypt.compare(password, user.password);`
    // 4. If the password is invalid, return a 401 response.
    // 5. If everything is valid, generate a JWT token signed with user's ID:
    //    Hint: `const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });`
    // 6. Return a 200 response with the token and user object (excluding the password).
    // =========================================================================

    // Remove or comment out this block when you start implementing the login function
    res.status(501).json({
      message: "TODO: Implement login logic! Follow the comments in src/controller/auth.controller.ts",
    });
  } catch (error) {
    next(error);
  }
};
