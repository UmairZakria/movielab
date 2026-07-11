import connectDB from "@/lib/db";
import PageView from "@/lib/models/PageView";

export async function POST(request) {
  try {
    const { path } = await request.json();
    if (!path) {
      return Response.json({ error: "path is required" }, { status: 400 });
    }

    await connectDB();

    const today = new Date().toISOString().split("T")[0];
    const result = await PageView.findOneAndUpdate(
      { path, date: today },
      { $inc: { count: 1 } },
      { upsert: true, new: true },
    );

    return Response.json({ count: result.count });
  } catch (error) {
    // Silently fail - tracking shouldn't break the app
    return Response.json({ error: "Tracking failed" }, { status: 500 });
  }
}
