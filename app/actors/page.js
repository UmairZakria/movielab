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
  title: "Discover Popular Actors & Directors | MovieLab",
  description: "Browse and discover popular actors, directors, producers, and writers on MovieLab. Explore their filmography, biography, and top movies.",
  alternates: {
    canonical: "https://movies.umairlab.com/actors",
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
  return (
    <>
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
