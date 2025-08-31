import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controllers.js";
import {
  authenticateUser,
  requireAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin only routes
router.post("/", authenticateUser, requireAdmin, createCategory);
router.put("/:id", authenticateUser, requireAdmin, updateCategory);
router.delete("/:id", authenticateUser, requireAdmin, deleteCategory);

export default router;
