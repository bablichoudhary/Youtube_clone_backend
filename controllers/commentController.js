import Comment from "../models/Comment.js";
import Video from "../models/Video.js";
import mongoose from "mongoose";

// Add a Comment
export const addComment = async (req, res) => {
  try {
    const { videoId, text } = req.body;

    // Create and save the comment
    const newComment = new Comment({
      userId: req.user.id, // User's ID from token (ensure req.user is set correctly)
      videoId,
      text,
    });

    const savedComment = await newComment.save();
    const populatedComment = await savedComment.populate("userId", "username"); // Populate username

    // Attach the new comment to the video's comments array
    await Video.findByIdAndUpdate(videoId, {
      $push: { comments: savedComment._id },
    });
    res.status(201).json(populatedComment); // Return full comment with username
  } catch (err) {
    console.error("Error adding comment:", err.message);
    res.status(500).json({ error: "Failed to add comment." });
  }
};

// Get Comments for a Video
export const getComments = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const comments = await Comment.find({
      videoId: req.params.videoId,
    })
      .populate("userId", "username") // Populate username
      .exec();

    res.status(200).json(comments); // Send the populated comments array
  } catch (err) {
    console.error("Error fetching comments:", err.message);
    res.status(500).json({ error: "Failed to fetch comments." });
  }
};

// Delete a Comment
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check if the logged-in user is the owner of the comment
    if (comment.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized action" });

    await Comment.findByIdAndDelete(req.params.commentId);

    // Remove the comment reference from the associated video's comments array
    await Video.findByIdAndUpdate(comment.videoId, {
      $pull: { comments: comment._id },
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err.message);
    res.status(500).json({ error: "Failed to delete comment." });
  }
};
