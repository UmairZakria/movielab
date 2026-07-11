import mongoose from "mongoose";

const pageViewSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    count: { type: Number, default: 1 },
  },
  { timestamps: true },
);

pageViewSchema.index({ path: 1, date: 1 }, { unique: true });

export default mongoose.models.PageView || mongoose.model("PageView", pageViewSchema);
