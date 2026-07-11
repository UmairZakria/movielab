import mongoose from "mongoose";

const adConfigSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    adUrls: { type: [String], default: [] },
    minThreshold: { type: Number, default: 3, min: 1 },
    maxThreshold: { type: Number, default: 5, min: 1 },
  },
  { timestamps: true },
);

export default mongoose.models.AdConfig ||
  mongoose.model("AdConfig", adConfigSchema);
