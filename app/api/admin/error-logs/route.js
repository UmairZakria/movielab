import connectDB from "@/lib/db";
import ErrorLog from "@/lib/models/ErrorLog";
import { withAuth, checkRole } from "@/lib/middleware";

export async function GET(request) {
  const payload = withAuth(request);
  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!checkRole(payload, "super_admin", "moderator")) {
    return Response.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    await connectDB();

    const errors = await ErrorLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ErrorLog.countDocuments();

    return Response.json({ errors, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Error fetching error logs:", error);
    return Response.json({ error: "Failed to fetch error logs" }, { status: 500 });
  }
}

// PATCH — mark error as resolved
export async function PATCH(request) {
  const payload = withAuth(request);
  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!checkRole(payload, "super_admin")) {
    return Response.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const { errorId, resolved } = await request.json();
    if (!errorId) {
      return Response.json({ error: "errorId is required" }, { status: 400 });
    }

    await connectDB();
    await ErrorLog.findByIdAndUpdate(errorId, { resolved: resolved ?? true });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating error log:", error);
    return Response.json({ error: "Failed to update error log" }, { status: 500 });
  }
}
