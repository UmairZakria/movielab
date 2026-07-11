import connectDB from "@/lib/db";
import ErrorLog from "@/lib/models/ErrorLog";

export async function logError({ message, stack = "", url = "", method = "", statusCode = 500, userAgent = "" }) {
  try {
    await connectDB();
    await ErrorLog.create({ message, stack, url, method, statusCode, userAgent });
  } catch (e) {
    console.error("Failed to log error:", e.message);
  }
}
