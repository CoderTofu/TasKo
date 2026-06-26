import { Response, NextFunction } from "express";
import { prisma } from "../prisma.js";
import { AuthRequest } from "../types/index.js";
import { TaskStatus } from "@prisma/client";
import { error } from "console";

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

    const task = await prisma.task.findUnique({
      where: {id}
    })

    if (!task) {
      res.status(404).json({error: "Task not found"})
      return
    }

    if (task.ownerId != req.user.id) {
      res.status(403).json({error: "Forbidden. You do not own this task."})
      return
    }

    const updatedTask = await prisma.task.update({
      where: {id},
      data: {
        title: title !== undefined ? title: undefined,
        description: description !== undefined ? description: undefined,
        status: status !== undefined ? status: undefined,
        dueDate: dueDate !== undefined ? dueDate: undefined,
      }
    })

    res.json(updatedTask);
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

    const task = await prisma.task.findUnique({
      where: {id}
    })

    if (!task) {
      res.status(404).json({error: "Task not found."})
      return
    }

    if (task.ownerId !== req.user.id) {
      res.status(403).json({error: "Forbidden. You do not own this task."})
      return
    }

    await prisma.task.delete({
      where: {id}
    })
    
    res.status(200).json({success: true})

  } catch (error) {
    next(error);
  }
};
