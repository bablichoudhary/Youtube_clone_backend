import mongoose from "mongoose";
import Video from "./Video.js"; // Adjust the path if needed

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
// Middleware to delete videos when a channel is deleted
ChannelSchema.pre("findOneAndDelete", async function (next) {
  const channelId = this.getQuery()["_id"];
  await Video.deleteMany({ channelId });
  next();
});

//  Explicitly define collection name as "channels"
export default mongoose.model("Channel", ChannelSchema, "channels");
