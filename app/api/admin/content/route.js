import { withAuth, checkRole } from "@/lib/middleware";

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const TMDB_BASE = process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.themoviedb.org/3";

export async function GET(request) {
  const payload = withAuth(request);
  if (!payload) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!checkRole(payload, "super_admin", "moderator")) {
    return Response.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const type = searchParams.get("type") || "movie"; // movie, tv, multi
  const page = searchParams.get("page") || "1";

  if (!query) {
    return Response.json({ error: "query is required" }, { status: 400 });
  }

  try {
    let endpoint;
    if (type === "multi") {
      endpoint = `${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
    } else {
      endpoint = `${TMDB_BASE}/search/${type}?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&page=${page}&append_to_response=videos,credits`;
    }

    const res = await fetch(endpoint);
    const data = await res.json();

    return Response.json(data);
  } catch (error) {
    console.error("Error searching content:", error);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
