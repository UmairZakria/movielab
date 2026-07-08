const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const EXTERNAL_DATA_URL = "https://movies.umairlab.com";

const createSlug = (title, id, type) => {
  if (!title) return id;
  const prefix = type === "tv" ? "tv-" : "";
  return `${prefix}${title.toLowerCase().replace(/[^\w-]+/g, "")}-${id}`;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(i) {
  await sleep(i * 200); // Stagger requests 200ms apart to avoid rate limiting
  const res = await fetch(
    `${TMDB_BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&primary_release_date.gte=2000-01-01&page=${i}`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

export async function GET() {
  try {
    const totalPages = 50;
    const promises = [];
    for (let i = 1; i <= totalPages; i++) {
      promises.push(fetchPage(i));
    }

    const results = await Promise.allSettled(promises);
    const movies = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    const seen = new Set();
    movies.forEach((item) => {
      if (seen.has(item.id)) return;
      seen.add(item.id);
      const slug = createSlug(item.title, item.id, "movie");
      xml += "  <url>\n";
      xml += `    <loc>${EXTERNAL_DATA_URL}/movie/${slug}</loc>\n`;
      xml += `    <lastmod>${item.release_date || "2026-01-01"}</lastmod>\n`;
      xml += "    <changefreq>weekly</changefreq>\n";
      xml += "    <priority>0.8</priority>\n";
      xml += "  </url>\n";
    });

    xml += "</urlset>";

    return new Response(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("Movies sitemap error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
