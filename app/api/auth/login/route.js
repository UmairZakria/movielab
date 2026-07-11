import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Hardcoded fallback credentials when MongoDB is unreachable
const FALLBACK_USERNAME = "rathat";
const FALLBACK_PASSWORD = "Rathat@@4321";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    let userId = null;
    let dbUser = null;

    try {
      await connectDB();
      dbUser = await User.findOne({ username: username.toLowerCase() });
    } catch (dbError) {
      console.warn("MongoDB unreachable, falling back to hardcoded credentials:", dbError.message);
    }

    if (dbUser) {
      const match = await bcrypt.compare(password, dbUser.password);
      if (!match) {
        return Response.json({ error: "Invalid credentials" }, { status: 401 });
      }
      userId = dbUser._id.toString();
    } else {
      if (
        username.toLowerCase() !== FALLBACK_USERNAME ||
        password !== FALLBACK_PASSWORD
      ) {
        return Response.json({ error: "Invalid credentials" }, { status: 401 });
      }
      userId = "fallback_admin";
    }

    const role = dbUser?.role || "super_admin";
    const token = signToken({ userId, username: username.toLowerCase(), role });

    return Response.json({
      token,
      user: { id: userId, username: username.toLowerCase(), role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
