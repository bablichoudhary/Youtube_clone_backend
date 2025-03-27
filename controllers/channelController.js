import Channel from "../models/Channel.js";
import Video from "../models/Video.js";

// Create a Channel
export const createChannel = async (req, res) => {
  try {
    const { channelName, description, channelBanner } = req.body;

    // ✅ Check if user already has a channel
    const existingChannel = await Channel.findOne({ owner: req.user.id });
    if (existingChannel)
      return res.status(400).json({ message: "You already have a channel." });

    const newChannel = new Channel({
      channelName,
      description,
      channelBanner,
      owner: req.user.id,
      subscribers: [],
      videos: [],
    });

    await newChannel.save();
    res.status(201).json(newChannel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Channel by Channel ID
export const getChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId).populate(
      "videos"
    );
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Channel by User ID
export const getChannelByUser = async (req, res) => {
  try {
    const channel = await Channel.findOne({
      owner: req.params.userId,
    }).populate("videos");

    if (!channel) {
      return res.status(200).json(null); // Return `null` instead of `404`
    }

    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Step 2: Delete the channel

export const deleteChannel = async (req, res) => {
  try {
    const channelId = req.params.id; // Extract channel ID from request params

    if (!channelId) {
      return res.status(400).json({ message: "Channel ID is missing" });
    }

    // Delete related videos and channel
    await Video.deleteMany({ channelId: channelId }); // Delete videos linked to this channel
    const deletedChannel = await Channel.findByIdAndDelete(channelId);

    if (!deletedChannel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    res.status(200).json({ message: "Channel and related videos deleted" });
  } catch (error) {
    console.error("Error deleting channel:", error);
    res.status(500).json({ message: "Failed to delete channel and videos" });
  }
};
// Subscribe or Unsubscribe to a Channel
export const subscribeChannel = async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user.id; // User ID from token

  try {
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const alreadySubscribed = channel.subscribers.includes(userId);
    alreadySubscribed
      ? (channel.subscribers = channel.subscribers.filter(
          (id) => id !== userId
        ))
      : channel.subscribers.push(userId);

    const updatedChannel = await channel.save();
    res.json({
      message: alreadySubscribed ? "Unsubscribed" : "Subscribed",
      subscribers: updatedChannel.subscribers.length,
    });
  } catch (error) {
    console.error("Error subscribing to channel:", error.message);
    res
      .status(500)
      .json({ message: "Failed to subscribe/unsubscribe to channel" });
  }
};

// Controller for Disliking a video
export const dislikeVideo = async (req, res) => {
  try {
    // Find the video by ID
    const video = await Video.findById(req.params.id);
    
    // If the video doesn't exist, return a 404 error
    if (!video) {
      return res.status(404).json({ message: "Video not found!" });
    }

    // Increment the dislike count
    video.dislikes += 1;

    // Save the updated video
    await video.save();

    // Return the updated dislike count in the response
    res.status(200).json({ message: "Disliked successfully", dislikes: video.dislikes });
  } catch (error) {
    // Catch any errors and return a 500 server error
    res.status(500).json({ message: "Server error", error: error.message });
  }
};