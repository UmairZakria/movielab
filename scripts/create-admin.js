const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://umairzakria6:4orpLINMatjQ6Fra@cluster0.5dcfg.mongodb.net/movielab?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: "movielab" });
  console.log("Connected to MongoDB");

  // Create admin user
  const User = mongoose.model(
    "User",
    new mongoose.Schema(
      {
        username: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["super_admin", "moderator"], default: "moderator" },
      },
      { timestamps: true },
    ),
  );

  const existing = await User.findOne({ username: "rathat" });
  if (existing) {
    console.log("Admin user already exists, skipping...");
    // Update existing user to super_admin if they aren't already
    if (existing.role !== "super_admin") {
      await User.updateOne({ username: "rathat" }, { role: "super_admin" });
      console.log("Updated existing user to super_admin");
    }
  } else {
    const hashed = await bcrypt.hash("Rathat@@4321", 10);
    await User.create({ username: "rathat", password: hashed, role: "super_admin" });
    console.log("Super admin created: rathat / Rathat@@4321");
  }

  // Create default ad config
  const AdConfig = mongoose.model(
    "AdConfig",
    new mongoose.Schema(
      {
        enabled: Boolean,
        adUrls: [String],
        minThreshold: Number,
        maxThreshold: Number,
      },
      { timestamps: true },
    ),
  );

  const existingConfig = await AdConfig.findOne();
  if (existingConfig) {
    console.log("Ad config already exists, skipping...");
  } else {
    await AdConfig.create({
      enabled: true,
      adUrls: [
        "https://youtu.be/Y9dwd5xzTzM",
        "https://youtube.com/shorts/aNzrEmXT970?feature=share",
        "https://youtu.be/kI7OZL8UGiE",
        "https://youtube.com/shorts/KI6Z_J4PJ1I?feature=share",
        "https://youtu.be/Lg7vNJHIaDE",
        "https://youtube.com/shorts/piSwV8-MVn0?feature=share",
        "https://youtu.be/mtFb7k570Rw",
        "https://youtube.com/shorts/I1vdqW5Nh1A?feature=share",
        "https://youtu.be/vmEPAscUgoA",
      ],
      minThreshold: 3,
      maxThreshold: 5,
    });
    console.log("Default ad config created");
  }

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
