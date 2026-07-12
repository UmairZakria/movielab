export async function GET() {
  const SITE = "https://movieslab.online";
  const today = new Date().toISOString().split("T")[0];

  const urls = [
    { loc: "/",          changefreq: "daily",   priority: "1.0" },
    { loc: "/discover/anime", changefreq: "weekly",  priority: "0.9" },
    { loc: "/actors",    changefreq: "weekly",  priority: "0.8" },
    { loc: "/studios",   changefreq: "weekly",  priority: "0.7" },
    { loc: "/countries", changefreq: "weekly",  priority: "0.7" },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach(({ loc, changefreq, priority }) => {
    xml += "  <url>\n";
    xml += `    <loc>${SITE}${loc}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += "  </url>\n";
  });

  xml += "</urlset>";

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
