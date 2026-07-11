import { withAuth } from "@/lib/middleware";

export async function GET(request) {
  const payload = withAuth(request);
  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ user: { id: payload.userId, username: payload.username, role: payload.role || "moderator" } });
}
