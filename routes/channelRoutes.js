import express from "express";
import {
  createChannel,
  getChannel,
  getChannelByUser,
  deleteChannel,
  subscribeChannel,
} from "../controllers/channelController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createChannel); // Create a new channel
router.get("/:channelId", getChannel); //  Fetch channel by ID
router.post("/:channelId/subscribe", verifyToken, subscribeChannel); // Subscribe or unsubscribe to a channel
router.get("/user/:userId", verifyToken, getChannelByUser); // Fetch channel by user
router.delete("/:id", deleteChannel);// delete channel

export default router;
