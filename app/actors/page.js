import ActorsClient from "./ActorsClient";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

async function getTrendingActors() {
  const url = `${BASE_URL}/trending/person/week?api_key=${API_KEY}&page=1`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error("Failed to fetch trending actors");
  const data = await res.json();
  return (data.results || []).filter(item => item.profile_path && item.known_for_department === "Acting");
}

async function getPopularActors() {
  const url = `${BASE_URL}/person/popular?api_key=${API_KEY}&page=1`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error("Failed to fetch popular actors");
  const data = await res.json();
  return (data.results || []).filter(item => item.profile_path && item.known_for_department === "Acting");
}

export const metadata = {
  title: "Browse Popular Actors & Directors",
  description: "Discover popular actors, directors, producers, and writers on Movieslab. Explore their filmography, biography, and top movies.",
  alternates: {
    canonical: "https://movieslab.online/actors",
  },
};

export default async function Page() {
  let trendingInitial = [];
  let popularInitial = [];
  try {
    [trendingInitial, popularInitial] = await Promise.all([
      getTrendingActors(),
      getPopularActors(),
    ]);
  } catch (err) {
    console.error("Error fetching initial actors on server:", err);
  }

  // Pre-render layout with HTML so bots can crawl actor profiles immediately
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Popular Actors & Directors",
    "description": "Browse and discover popular actors, directors, producers, and writers on Movieslab.",
    "url": "https://movieslab.online/actors",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": popularInitial.map((actor, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": `https://movieslab.online/actor/${actor.name.toLowerCase().replace(/ /g, "-")}-${actor.id}`,
        "item": {
          "@type": "Person",
          "name": actor.name,
          "jobTitle": actor.known_for_department,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <div className="sr-only">
        <h2>Popular Actors List</h2>
        <ul>
          {popularInitial.map((actor) => (
            <li key={actor.id}>
              <a href={`/actor/${actor.name.toLowerCase().replace(/ /g, "-")}-${actor.id}`}>
                {actor.name} - {actor.known_for_department}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <ActorsClient trendingInitial={trendingInitial} popularInitial={popularInitial} />
    </>
  );
}
