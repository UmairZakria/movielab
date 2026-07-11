import { verifyToken } from "./auth";

export function withAuth(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return verifyToken(authHeader.split(" ")[1]);
}

export function checkRole(payload, ...roles) {
  if (!payload) return false;
  return roles.includes(payload.role);
}
