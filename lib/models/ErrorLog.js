import mongoose from "mongoose";

const errorLogSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    stack: { type: String, default: "" },
    url: { type: String, default: "" },
    method: { type: String, default: "" },
    statusCode: { type: Number, default: 500 },
    userAgent: { type: String, default: "" },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.models.ErrorLog || mongoose.model("ErrorLog", errorLogSchema);
