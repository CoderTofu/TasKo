import { Router } from "express";
import { getMe, updateMe } from "../controller/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Apply auth middleware to all profile routes
router.use(requireAuth);

router.get("/me", getMe);
router.put("/me", updateMe);

export default router;
