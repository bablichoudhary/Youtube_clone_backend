import mongoose from "mongoose";

const ChannelSchema = new mongoose.Schema(
  {
    channelName: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: { type: String },
    channelBanner: { type: String, default: "" },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  },
  { timestamps: true }
);

// ✅ Explicitly define collection name as "channels"
export default mongoose.model("Channel", ChannelSchema, "channels");
