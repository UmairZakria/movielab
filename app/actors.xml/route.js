const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const EXTERNAL_DATA_URL = "https://movies.umairlab.com";

const createSlug = (name, id) => {
  if (!name) return `actor-${id}`;
  return `${name.toLowerCase().replace(/[^\w-]+/g, "-").replace(/--+/g, "-").replace(/^-|-$/g, "")}-${id}`;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(page) {
  await sleep(page * 200);
  const res = await fetch(
    `${TMDB_BASE_URL}/person/popular?api_key=${API_KEY}&language=en-US&page=${page}`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

export async function GET() {
  try {
    const totalPages = 100;
    const promises = [];
    for (let i = 1; i <= totalPages; i++) {
      promises.push(fetchPage(i));
    }

    const results = await Promise.allSettled(promises);
    const actors = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    const seen = new Set();
    actors.forEach((actor) => {
      if (!actor.id || seen.has(actor.id)) return;
      seen.add(actor.id);
      const slug = createSlug(actor.name, actor.id);
      xml += "  <url>\n";
      xml += `    <loc>${EXTERNAL_DATA_URL}/actor/${slug}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>\n`;
      xml += "    <changefreq>monthly</changefreq>\n";
      xml += "    <priority>0.6</priority>\n";
      xml += "  </url>\n";
    });

    xml += "</urlset>";

    return new Response(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch (error) {
    console.error("Actors sitemap error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
