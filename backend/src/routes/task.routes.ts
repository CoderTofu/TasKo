import { Router } from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../controller/task.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Apply auth middleware to all task routes
router.use(requireAuth);

router.get("/", getTasks);
router.post("/", createTask);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
