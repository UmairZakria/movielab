import Home from "./components/Home";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

async function fetchJson(url) {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return { results: [] };
    return await res.json();
  } catch {
    return { results: [] };
  }
}

async function getInitialData() {
  const [
    trendingRes,
    horrorRes,
    sciFiRes,
    keywordsRes,
  ] = await Promise.all([
    fetchJson(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&include_adult=false`),
    fetchJson(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27&sort_by=popularity.desc&include_adult=false`),
    fetchJson(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=878&sort_by=popularity.desc&include_adult=false`),
    fetchJson(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&include_adult=false`),
  ]);

  const seen = new Set();
  const uniqueById = (list) => {
    const out = [];
    for (const item of list || []) {
      if (!item || !item.id || seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    }
    return out;
  };

  const trendingToday = { results: uniqueById(trendingRes.results).slice(0, 15), keywords: [] };
  const horrorMovies = { results: uniqueById(horrorRes.results).slice(0, 15), keywords: [] };
  const sciFiMovies = { results: uniqueById(sciFiRes.results).slice(0, 15), keywords: [] };

  // Fetch keywords for top trending movies (lightweight)
  const topMovies = (trendingRes.results || []).slice(0, 6);
  const keywordResults = await Promise.all(
    topMovies.map((m) =>
      fetchJson(`${BASE_URL}/movie/${m.id}/keywords?api_key=${API_KEY}`).then((d) => d.keywords || [])
    )
  );
  const kwMap = new Map();
  keywordResults.flat().forEach((k) => {
    if (k && k.id && !kwMap.has(k.id)) kwMap.set(k.id, k);
  });
  const trendingKeywords = Array.from(kwMap.values()).slice(0, 50);

  return {
    rows: {
      trendingToday,
      horrorMovies,
      sciFiMovies,
    },
    trendingKeywords,
  };
}

export const metadata = {
  title: "Movieslab - Watch Free Movies & TV Series Online (HD 1080p)",
  description:
    "Discover and stream trending movies, new releases, and curated collections on Movieslab. Browse Hollywood, Bollywood, Korean, Anime, and web series for free in HD 1080p.",
  alternates: {
    canonical: "https://movieslab.online",
  },
};

export default async function Page() {
  let initialData = {};
  try {
    initialData = await getInitialData();
  } catch (err) {
    // Fail open — the client component will refetch if needed
    initialData = {};
  }

  return (
    <>
      {/* Server-rendered H1 for SEO — visible to crawlers, hidden from users (navbar logo handles branding) */}
      <h1 className="sr-only">
        Movieslab - Watch Free Movies and TV Series Online in HD 1080p
      </h1>
      <Home initialData={initialData} />
    </>
  );
}
