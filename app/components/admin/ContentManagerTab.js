"use client";
import { useState } from "react";
import { Search, ExternalLink, Film, Tv, User } from "lucide-react";

const TOKEN_KEY = "movielab_admin_token";

const TMDB_IMG = "https://image.tmdb.org/t/p";

export default function ContentManagerTab() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("multi");
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);

  const search = async (p = 1) => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setPage(p);
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      const res = await fetch(
        `/api/admin/content?query=${encodeURIComponent(query)}&type=${type}&page=${p}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setTotalResults(data.total_results || 0);
      }
    } catch (e) {}
    setLoading(false);
  };

  const getTitle = (item) => item.title || item.name || "Untitled";
  const getDate = (item) => {
    const d = item.release_date || item.first_air_date;
    return d ? d.split("-")[0] : "";
  };
  const getType = (item) => {
    if (item.media_type === "movie" || item.title) return "movie";
    if (item.media_type === "tv" || item.first_air_date) return "tv";
    if (item.media_type === "person" || item.known_for_department) return "person";
    return "movie";
  };
  const getLink = (item) => {
    const t = getType(item);
    if (t === "person") return `https://www.themoviedb.org/person/${item.id}`;
    return `https://www.themoviedb.org/${t}/${item.id}`;
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-zinc-800/50 rounded-xl p-5 border border-zinc-700/50 space-y-4">
        <h3 className="font-semibold text-white">Search TMDB</h3>
        <p className="text-sm text-zinc-400">Find movies, TV shows, or actors by name</p>

        <div className="flex gap-2">
          <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
            {[
              { value: "multi", label: "All" },
              { value: "movie", label: "Movies" },
              { value: "tv", label: "TV" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  type === t.value
                    ? "bg-primary text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search movies, TV shows, actors..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary"
          />
          <button
            onClick={() => search()}
            disabled={loading || !query.trim()}
            className="px-4 py-2 bg-primary text-black rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity font-medium text-sm flex items-center gap-1.5"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search size={16} />
            )}
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : searched && results.length === 0 ? (
        <p className="text-zinc-500 text-center py-10">No results found</p>
      ) : (
        results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">{totalResults.toLocaleString()} results</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results
                .filter((item) => getType(item) !== "person")
                .slice(0, 20)
                .map((item) => (
                  <div
                    key={item.id + "-" + getType(item)}
                    className="flex gap-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 hover:bg-zinc-800 transition-colors"
                  >
                    <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-zinc-900">
                      {item.poster_path ? (
                        <img
                          src={`${TMDB_IMG}/w92${item.poster_path}`}
                          alt={getTitle(item)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          {getType(item) === "tv" ? <Tv size={20} /> : <Film size={20} />}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <h4 className="text-sm font-medium text-white truncate">
                          {getTitle(item)}
                        </h4>
                        {getDate(item) && (
                          <span className="text-xs text-zinc-500 shrink-0 mt-0.5">
                            {getDate(item)}
                          </span>
                        )}
                      </div>
                      {item.overview && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-3">
                          {item.overview}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {item.vote_average > 0 && (
                          <span className="text-xs text-primary font-medium">
                            ★ {item.vote_average.toFixed(1)}
                          </span>
                        )}
                        <a
                          href={getLink(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-zinc-500 hover:text-primary flex items-center gap-1 ml-auto transition-colors"
                        >
                          TMDB <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Pagination */}
            {totalResults > 20 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => search(page - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm bg-zinc-800 rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-zinc-400">Page {page}</span>
                <button
                  onClick={() => search(page + 1)}
                  disabled={results.length < 20}
                  className="px-3 py-1.5 text-sm bg-zinc-800 rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
