import { Response, NextFunction } from "express";
import { prisma } from "../prisma.js";
import { AuthRequest } from "../types/index.js";
import { TaskStatus } from "@prisma/client";

export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const { id } = req.params;
    if (typeof id !== "string") {
      res.status(400).json({ error: "Invalid task ID." });
      return;
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      res.status(404).json({ error: "Task not found." });
      return;
    }

    // Check ownership
    if (task.ownerId !== req.user.id) {
      res.status(403).json({ error: "Forbidden. You do not own this task." });
      return;
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const { title, description, status, dueDate } = req.body;

    if (!title) {
      res.status(400).json({ error: "Title is required." });
      return;
    }

    // Validate status value if provided
    let taskStatus: TaskStatus = TaskStatus.TODO;
    if (status) {
      if (Object.values(TaskStatus).includes(status)) {
        taskStatus = status;
      } else {
        res.status(400).json({ error: "Invalid task status." });
        return;
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: taskStatus,
        dueDate: dueDate ? new Date(dueDate) : null,
        ownerId: req.user.id,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const { id } = req.params;
    if (typeof id !== "string") {
      res.status(400).json({ error: "Invalid task ID." });
      return;
    }
    const { title, description, status, dueDate } = req.body;

    // =========================================================================
    // EXERCISE TODO: Complete the updateTask function
    //
    // Guidelines:
    // 1. Fetch the task from the database by ID using `prisma.task.findUnique`.
    // 2. If the task does not exist, return a 404 response.
    // 3. Verify that the task's `ownerId` matches `req.user.id`.
    //    If it doesn't match, return a 403 Forbidden response.
    // 4. Update the task using `prisma.task.update` with the new fields:
    //    - title (if provided)
    //    - description (if provided or updated)
    //    - status (if provided, validate it against the TaskStatus enum)
    //    - dueDate (if provided, parse it to Date or set to null)
    // 5. Return the updated task with a 200 Status code.
    // =========================================================================

    // Remove or comment out this block when you start implementing the updateTask function
    res.status(501).json({
      message: "TODO: Implement updateTask logic! Follow the comments in src/controller/task.controller.ts",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized." });
      return;
    }

    const { id } = req.params;
    if (typeof id !== "string") {
      res.status(400).json({ error: "Invalid task ID." });
      return;
    }

    // =========================================================================
    // EXERCISE TODO: Complete the deleteTask function
    //
    // Guidelines:
    // 1. Fetch the task from the database by ID.
    // 2. If the task doesn't exist, return a 404 response.
    // 3. Verify that the task's `ownerId` matches `req.user.id`.
    //    If it doesn't match, return a 403 Forbidden response.
    // 4. Delete the task using `prisma.task.delete`.
    // 5. Return a 200/204 response (or a success message: e.g. { success: true })
    // =========================================================================

    // Remove or comment out this block when you start implementing the deleteTask function
    res.status(501).json({
      message: "TODO: Implement deleteTask logic! Follow the comments in src/controller/task.controller.ts",
    });
  } catch (error) {
    next(error);
  }
};
