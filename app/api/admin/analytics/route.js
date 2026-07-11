import connectDB from "@/lib/db";
import PageView from "@/lib/models/PageView";
import User from "@/lib/models/User";
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
    await connectDB();

    // Total page views (all time)
    const pageViewAgg = await PageView.aggregate([
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]);
    const totalPageViews = pageViewAgg[0]?.total || 0;

    // Unique pages visited
    const uniquePages = await PageView.distinct("path");
    const uniquePageCount = uniquePages.length;

    // Total users
    const totalUsers = await User.countDocuments();

    // Total errors
    const totalErrors = await ErrorLog.countDocuments();
    const unresolvedErrors = await ErrorLog.countDocuments({ resolved: false });

    // Page views today
    const today = new Date().toISOString().split("T")[0];
    const todayViewsAgg = await PageView.aggregate([
      { $match: { date: today } },
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]);
    const todayViews = todayViewsAgg[0]?.total || 0;

    // Top pages this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = weekAgo.toISOString().split("T")[0];

    const topPages = await PageView.aggregate([
      { $match: { date: { $gte: weekStr } } },
      { $group: { _id: "$path", total: { $sum: "$count" } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    // Views per day (last 14 days)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const twoWeeksStr = twoWeeksAgo.toISOString().split("T")[0];

    const dailyViews = await PageView.aggregate([
      { $match: { date: { $gte: twoWeeksStr } } },
      { $group: { _id: "$date", total: { $sum: "$count" } } },
      { $sort: { _id: 1 } },
    ]);

    return Response.json({
      totalPageViews,
      uniquePageCount,
      totalUsers,
      totalErrors,
      unresolvedErrors,
      todayViews,
      topPages,
      dailyViews,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return Response.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
