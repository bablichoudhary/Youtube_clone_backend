import express from "express";
import {
  addComment,
  getComments,
  deleteComment,
} from "../controllers/commentController.js"; // Ensure deleteComment is imported
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, addComment);
router.get("/:videoId", getComments);
router.delete("/:commentId", verifyToken, deleteComment); // Ensure this function exists

export default router;
