import mongoose from "mongoose";

const siteConfigSchema = new mongoose.Schema(
  {
    maintenance: {
      enabled: { type: Boolean, default: false },
      message: { type: String, default: "Site is under maintenance. We'll be back soon!" },
    },
    seo: {
      title: { type: String, default: "MovieLab - Watch Free Movies & TV Series Online (1080p HD)" },
      description: { type: String, default: "Stream over 100,000+ movies and TV shows for free in Full HD 1080p." },
      keywords: { type: [String], default: [] },
      ogImage: { type: String, default: "/og-image.jpg" },
      robotsEnabled: { type: Boolean, default: true },
    },
    features: {
      searchEnabled: { type: Boolean, default: true },
      discoverEnabled: { type: Boolean, default: true },
      studioEnabled: { type: Boolean, default: true },
      actorsEnabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

export default mongoose.models.SiteConfig || mongoose.model("SiteConfig", siteConfigSchema);
