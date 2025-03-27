import mongoose from "mongoose";
import Video from "../models/Video.js";
import Channel from "../models/Channel.js";

// Function to escape special characters in regex for searches
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Like or Unlike Video
const likeVideo = async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user.id; // Get authenticated user ID from token

  try {
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    // Toggle like logic
    const alreadyLiked = video.likes.includes(userId);
    alreadyLiked
      ? (video.likes = video.likes.filter((id) => id !== userId)) // Unlike
      : video.likes.push(userId); // Like

    const updatedVideo = await video.save({ validateModifiedOnly: true });
    res.status(200).json({
      message: alreadyLiked ? "Video unliked" : "Video liked",
      likes: updatedVideo.likes.length,
    });
  } catch (error) {
    console.error("Error liking video:", error.message);
    res.status(500).json({ message: "Failed to like/unlike video" });
  }
};
// Dislike a video

export const dislikeVideo = async (req, res) => {
  try {
    const { id } = req.params; // Extract video ID from request params
    const userId = req.user.id; // Assume req.user contains authenticated user info

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check if the user has already disliked the video
    const isDisliked = video.dislikes.some(
      (dislikeId) => dislikeId.toString() === userId.toString()
    );

    if (isDisliked) {
      // If already disliked, remove the dislike (toggle off)
      video.dislikes = video.dislikes.filter(
        (dislikeId) => dislikeId.toString() !== userId.toString()
      );
    } else {
      // If not disliked, add the user's dislike (toggle on)
      video.dislikes.push(userId);
    }

    await video.save(); // Save the updated video to the database

    res.status(200).json({
      dislikes: video.dislikes.length, // Return updated dislikes count
      isDisliked: !isDisliked, // Return the toggled dislike status
    });
  } catch (error) {
    console.error("Error toggling dislike:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const searchVideos = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const escapedQuery = escapeRegex(query); // Escape special characters in the query

    // Perform search by title, description, and category
    const videos = await Video.find({
      $or: [
        { title: { $regex: escapedQuery, $options: "i" } },
        { description: { $regex: escapedQuery, $options: "i" } },
        { category: { $regex: escapedQuery, $options: "i" } },
      ],
    }).populate("channelId", "channelName");

    if (!videos || videos.length === 0) {
      return res.status(404).json({ message: "No matching videos found" });
    }

    res.status(200).json(videos); // Return the found videos
  } catch (error) {
    console.error("Error fetching search results:", error.message);
    res.status(500).json({ message: "Failed to fetch search results." });
  }
};

// Delete Video
const deleteVideo = async (req, res) => {
  try {
    const deletedVideo = await Video.findByIdAndDelete(req.params.videoId);
    if (!deletedVideo)
      return res.status(404).json({ message: "Video not found" });

    // Remove video from channel
    await Channel.findByIdAndUpdate(deletedVideo.channelId, {
      $pull: { videos: deletedVideo._id },
    });

    res.json({ message: "Video deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload Video
const createVideo = async (req, res) => {
  try {
    const { title, description, thumbnailUrl, videoUrl, category, channelId } =
      req.body;

    if (!title || !thumbnailUrl || !videoUrl || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const channel = channelId
      ? await Channel.findById(channelId)
      : await Channel.findOne({ owner: req.user.id });
    if (!channel) {
      console.error("Channel not found. User must create a channel first.");
      return res
        .status(400)
        .json({ message: "Please create a channel first." });
    }
    const newVideo = new Video({
      title,
      description,
      thumbnailUrl,
      videoUrl,
      category,
      uploader: req.user.id,
      channelId: channel._id,
    });

    const savedVideo = await newVideo.save();

    await Channel.findByIdAndUpdate(channel._id, {
      $push: { videos: savedVideo._id },
    });

    res.status(201).json(savedVideo);
  } catch (err) {
    console.error("Error uploading video:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Fetch All Videos with Channel Info
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find().populate("channelId", "channelName");
    res.json(videos);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch videos", error: error.message });
  }
};

// Fetch Single Video by ID (With Comments and Channel Info)
const getVideoById = async (req, res) => {
  try {
    // Validate ObjectId to prevent invalid id errors
    if (!mongoose.Types.ObjectId.isValid(req.params.videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const video = await Video.findById(req.params.videoId)
      .populate("channelId", "channelName channelBanner")
      .populate({
        path: "comments",
        populate: { path: "userId", select: "username" },
      });

    if (!video) return res.status(404).json({ message: "Video not found" });

    res.json(video);
  } catch (err) {
    console.error("Error fetching video:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Fetch Like Status for a Video
const getVideoLikeStatus = async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const liked = video.likes.includes(req.user.id); // Check like status
    res.status(200).json({ liked });
  } catch (error) {
    console.error("Error fetching video like status:", error.message);
    res.status(500).json({ message: "Failed to fetch like status" });
  }
};

// Increment Video View Count
const incrementViewCount = async (req, res) => {
  const { videoId } = req.params;

  try {
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } }, // Increment the views field by 1
      { new: true } // Return the updated video
    );

    if (!updatedVideo) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.status(200).json(updatedVideo);
  } catch (error) {
    console.error("Error incrementing video views:", error.message);
    res.status(500).json({ message: "Failed to increment views" });
  }
};
// Export functions
export {
  searchVideos,
  likeVideo,
  createVideo,
  getVideos,
  getVideoById,
  deleteVideo,
  getVideoLikeStatus,
  incrementViewCount,
};
