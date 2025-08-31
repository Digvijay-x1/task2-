import express from "express";
import {
  register,
  login,
  me,
  logout,
  updateProfile,
} from "../controllers/auth.controllers.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public 
router.post("/register", register);
router.post("/login", login);

// Protected 
router.use(authenticateUser);
router.get("/me", me);
router.post("/logout", logout);
router.put("/profile", updateProfile);

export default router;
