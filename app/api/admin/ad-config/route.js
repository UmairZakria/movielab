import connectDB from "@/lib/db";
import AdConfig from "@/lib/models/AdConfig";
import { withAuth } from "@/lib/middleware";

const DEFAULT_URLS = [
  "https://youtu.be/Y9dwd5xzTzM",
  "https://youtube.com/shorts/aNzrEmXT970?feature=share",
  "https://youtu.be/kI7OZL8UGiE",
  "https://youtube.com/shorts/KI6Z_J4PJ1I?feature=share",
  "https://youtu.be/Lg7vNJHIaDE",
  "https://youtube.com/shorts/piSwV8-MVn0?feature=share",
  "https://youtu.be/mtFb7k570Rw",
  "https://youtube.com/shorts/I1vdqW5Nh1A?feature=share",
  "https://youtu.be/vmEPAscUgoA",
];

// GET — public (used by AdContext on every page load)
export async function GET() {
  try {
    await connectDB();
    let config = await AdConfig.findOne();
    if (!config) {
      config = await AdConfig.create({
        enabled: true,
        adUrls: DEFAULT_URLS,
        minThreshold: 3,
        maxThreshold: 5,
      });
    }
    return Response.json({
      enabled: config.enabled,
      adUrls: config.adUrls,
      minThreshold: config.minThreshold,
      maxThreshold: config.maxThreshold,
    });
  } catch (error) {
    console.error("Error fetching ad config:", error);
    return Response.json(
      { error: "Failed to fetch config" },
      { status: 500 },
    );
  }
}

// PUT — admin only
export async function PUT(request) {
  const payload = withAuth(request);
  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const update = {};

    if (typeof body.enabled === "boolean") update.enabled = body.enabled;
    if (Array.isArray(body.adUrls)) update.adUrls = body.adUrls;
    if (typeof body.minThreshold === "number") update.minThreshold = body.minThreshold;
    if (typeof body.maxThreshold === "number") update.maxThreshold = body.maxThreshold;

    // Validate thresholds
    if (update.minThreshold && update.maxThreshold && update.minThreshold > update.maxThreshold) {
      return Response.json(
        { error: "minThreshold cannot be greater than maxThreshold" },
        { status: 400 },
      );
    }

    await connectDB();

    const config = await AdConfig.findOneAndUpdate(
      {},
      { $set: update },
      { upsert: true, new: true },
    );

    return Response.json({
      enabled: config.enabled,
      adUrls: config.adUrls,
      minThreshold: config.minThreshold,
      maxThreshold: config.maxThreshold,
    });
  } catch (error) {
    console.error("Error updating ad config:", error);
    return Response.json(
      { error: "Failed to update config" },
      { status: 500 },
    );
  }
}
