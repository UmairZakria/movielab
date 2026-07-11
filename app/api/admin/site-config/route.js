import connectDB from "@/lib/db";
import SiteConfig from "@/lib/models/SiteConfig";
import { withAuth, checkRole } from "@/lib/middleware";

// GET — public, frontend needs to check maintenance mode
export async function GET(request) {
  try {
    await connectDB();
    let config = await SiteConfig.findOne();
    if (!config) {
      config = await SiteConfig.create({});
    }
    return Response.json({
      maintenance: config.maintenance,
      features: config.features,
    });
  } catch (error) {
    console.error("Error fetching site config:", error);
    return Response.json(
      { error: "Failed to fetch config" },
      { status: 500 },
    );
  }
}

// GET /admin — full config (admin only)
export async function PUT(request) {
  const payload = withAuth(request);
  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!checkRole(payload, "super_admin")) {
    return Response.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const body = await request.json();
    await connectDB();

    const update = {};
    if (body.maintenance !== undefined) update["maintenance.enabled"] = body.maintenance;
    if (body.maintenanceMessage !== undefined) update["maintenance.message"] = body.maintenanceMessage;
    if (body.seoTitle !== undefined) update["seo.title"] = body.seoTitle;
    if (body.seoDescription !== undefined) update["seo.description"] = body.seoDescription;
    if (body.seoKeywords !== undefined) update["seo.keywords"] = body.seoKeywords;
    if (body.ogImage !== undefined) update["seo.ogImage"] = body.ogImage;
    if (body.robotsEnabled !== undefined) update["seo.robotsEnabled"] = body.robotsEnabled;
    if (body.features !== undefined) update["features"] = body.features;

    const config = await SiteConfig.findOneAndUpdate(
      {},
      { $set: update },
      { upsert: true, new: true },
    );

    return Response.json({
      maintenance: config.maintenance,
      seo: config.seo,
      features: config.features,
    });
  } catch (error) {
    console.error("Error updating site config:", error);
    return Response.json(
      { error: "Failed to update config" },
      { status: 500 },
    );
  }
}
