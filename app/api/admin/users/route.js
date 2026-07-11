import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { withAuth, checkRole } from "@/lib/middleware";
import bcrypt from "bcryptjs";

// GET — list all users
export async function GET(request) {
  const payload = withAuth(request);
  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    return Response.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST — create a new user
export async function POST(request) {
  const payload = withAuth(request);
  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only super_admin can create users
  if (!checkRole(payload, "super_admin")) {
    return Response.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const { username, password, role } = await request.json();

    if (!username || !password) {
      return Response.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    await connectDB();

    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return Response.json({ error: "Username already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const validRole = ["super_admin", "moderator"].includes(role) ? role : "moderator";
    const user = await User.create({
      username: username.toLowerCase(),
      password: hashed,
      role: validRole,
    });

    return Response.json(
      { user: { id: user._id, username: user.username, role: user.role } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}

// DELETE — delete a user (only super_admin)
export async function DELETE(request) {
  const payload = withAuth(request);
  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRole(payload, "super_admin")) {
    return Response.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const { userId } = await request.json();
    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    // Prevent deleting yourself
    if (userId === payload.userId) {
      return Response.json(
        { error: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    await connectDB();
    await User.findByIdAndDelete(userId);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

// PATCH — update user role (only super_admin)
export async function PATCH(request) {
  const payload = withAuth(request);
  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!checkRole(payload, "super_admin")) {
    return Response.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  try {
    const { userId, role } = await request.json();
    if (!userId || !role) {
      return Response.json({ error: "userId and role are required" }, { status: 400 });
    }

    if (!["super_admin", "moderator"].includes(role)) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, select: { password: 0 } },
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    console.error("Error updating user role:", error);
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}
