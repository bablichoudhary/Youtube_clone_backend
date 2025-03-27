import express from "express";
import {
  createVideo,
  getVideos,
  getVideoById,
  deleteVideo,
  searchVideos,
  likeVideo,
  getVideoLikeStatus,
  incrementViewCount,
} from "../controllers/videoController.js";
import { dislikeVideo } from "../controllers/videoController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", searchVideos); // Search videos by title, description, or category
router.get("/:videoId/status", verifyToken, getVideoLikeStatus); //  Get like status
router.post("/:videoId/like", verifyToken, likeVideo); //  Toggle like/unlike on a video
// Define the route for disliking a video
router.post("/:id/dislike", verifyToken, dislikeVideo);

router.post("/", verifyToken, createVideo); //  Upload new video (Authenticated)
router.get("/", getVideos); // Get all videos with channel details
router.get("/:videoId", getVideoById); // Get video details by ID
// Increment view count for a video
router.patch("/:videoId/views", incrementViewCount);
router.delete("/:videoId", verifyToken, deleteVideo); //  Delete video by ID

export default router;
