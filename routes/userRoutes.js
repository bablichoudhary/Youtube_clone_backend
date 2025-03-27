import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser); // Register Route
router.post("/login", loginUser); // Login Route
router.get("/profile", verifyToken, getUserProfile); // Profile Route (protected)

export default router;
