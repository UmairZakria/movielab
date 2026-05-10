"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbar from "@/app/components/Navbar";
import { Play, Star, Calendar, Info, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import HoverOverlay from "@/app/components/HoverOverlay"; // Assuming this exists based on common patterns in the app

const StudioContent = ({ studioId }) => {
  const [studio, setStudio] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef();

  const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
  const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.themoviedb.org/3";

  useEffect(() => {
    const fetchStudioDetails = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/company/${studioId}?api_key=${API_KEY}`);
        setStudio(res.data);
      } catch (err) {
        console.error("Failed to fetch studio details", err);
      }
    };
    fetchStudioDetails();
  }, [studioId, API_KEY, BASE_URL]);

  const fetchStudioContent = async (pageNum) => {
    if (!studioId || !API_KEY) {
      console.log("Missing studioId or API_KEY", { studioId, API_KEY });
      return;
    }
    
    try {
      setLoading(true);
      
      const config = { timeout: 10000 }; // 10s timeout
      
      const results = await Promise.all([
        axios.get(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_companies=${studioId}&page=${pageNum}&sort_by=popularity.desc&include_adult=false`, config).catch(e => { console.error("Movie fetch failed", e); return null; }),
        axios.get(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_networks=${studioId}&page=${pageNum}&sort_by=popularity.desc&include_adult=false`, config).catch(e => { console.error("TV Network fetch failed", e); return null; }),
        axios.get(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_companies=${studioId}&page=${pageNum}&sort_by=popularity.desc&include_adult=false`, config).catch(e => { console.error("TV Company fetch failed", e); return null; })
      ]);

      let combined = [];
      results.forEach((res, index) => {
        if (res && res.data && res.data.results) {
          const type = index === 0 ? 'movie' : 'tv';
          const items = res.data.results.map(item => ({ ...item, media_type: type }));
          combined = [...combined, ...items];
        }
      });

      const uniqueResults = Array.from(new Map(combined.map(item => [item.id, item])).values())
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

      if (pageNum === 1) {
        setMovies(uniqueResults);
      } else {
        setMovies(prev => [...prev, ...uniqueResults]);
      }
      
      const maxPage = Math.max(...results.map(res => res?.data?.total_pages || 0));
      setHasMore(pageNum < maxPage && uniqueResults.length > 0);
    } catch (err) {
      console.error("Critical error in fetchStudioContent:", err);
      // If we hit a critical error on page 1, show empty state
      if (pageNum === 1) setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studioId) {
      fetchStudioContent(page);
    }
  }, [page, studioId, API_KEY, BASE_URL]);

  useEffect(() => {
    if (loading || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  const createSlug = (title, id, type = "movie") => {
    if (!title) return id;
    const prefix = type === "tv" ? "tv-" : "";
    return `${prefix}${title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")}-${id}`;
  };

  return (
    <div className="min-h-screen bg-black text-white font-poppins">
      <Navbar />

      {/* Studio Banner Section */}
      <div className="relative h-[40vh] lg:h-[50vh] pt-12 flex items-center justify-center overflow-hidden ">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-black to-black z-0" />
        
        <div className="relative z-10 flex flex-col items-center text-center px-4">
          {studio?.logo_path ? (
            <div className="bg-white p-8 rounded-3xl shadow-2xl mb-6">
              <img
                src={`https://image.tmdb.org/t/p/w500${studio.logo_path}`}
                alt={studio?.name}
                className="max-h-24 lg:max-h-32 object-contain filter grayscale"
              />
            </div>
          ) : (
            <h1 className="text-5xl lg:text-7xl font-bold font-comfortaa mb-4">
              {studio?.name}
            </h1>
          )}
          <h1 className="text-2xl lg:text-4xl font-bold font-comfortaa">
            {studio?.name}
          </h1>
          <div className="flex items-center gap-4 mt-4 text-gray-400">
            <span>{studio?.origin_country}</span>
            {studio?.homepage && (
              <>
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                <a href={studio.homepage} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  Official Website
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Movie Grid Section */}
      <main className=" px-4 lg:px-[3vw] py-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold font-comfortaa flex items-center gap-2">
            Productions
          </h2>
          <p className="text-gray-500 text-sm">
            Sorted by Popularity
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-[1.5vw]">
          {movies.map((movie) => (
            <div key={movie.id} className="relative group rounded-xl overflow-hidden aspect-[2/3] bg-zinc-900 border border-white/5">
              <Link href={`/${movie.media_type || 'movie'}/${createSlug(movie.title || movie.name, movie.id)}`}>
                <img
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/111/fff?text=No+Poster'}
                  alt={movie.title || movie.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <HoverOverlay 
                  movie={movie} 
                  createSlug={createSlug} 
                  mediaType={movie.media_type}
                  toggleWatchLater={() => {}} // Stub for now
                />
              </Link>
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-wider border border-white/10 text-white z-20">
                {movie.media_type === 'tv' ? 'Series' : 'Movie'}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && movies.length === 0 && (
          <div className="py-20 text-center">
            <div className="size-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info className="text-gray-500 size-10" />
            </div>
            <h3 className="text-xl font-bold font-comfortaa text-white mb-2">No productions found</h3>
            <p className="text-gray-500">We couldn't find any movies or series for this studio.</p>
            <Link href="/studios" className="inline-block mt-6 px-6 py-2 bg-primary text-black rounded-full font-bold hover:bg-primary/80 transition-all">
              Back to Studios
            </Link>
          </div>
        )}

        {/* Loading State / Observer Target */}
        <div ref={observerRef} className="h-20 flex items-center justify-center mt-12">
          {loading && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent animate-spin rounded-full" />
              <p className="text-gray-500 text-sm animate-pulse">Fetching collection...</p>
            </div>
          )}
          {!hasMore && movies.length > 0 && (
            <p className="text-gray-500 italic">End of collection</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudioContent;
