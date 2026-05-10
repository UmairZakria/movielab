"use client";
import React, { useState, useMemo } from "react";
import { Search as SearchIcon, Globe, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import { studiosData } from "@/lib/studiosData";

const StudiosContent = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Group studios by country for the main section
  const groupedByCountry = useMemo(() => {
    const groups = {};
    studiosData.forEach((studio) => {
      if (!groups[studio.country]) {
        groups[studio.country] = [];
      }
      groups[studio.country].push(studio);
    });
    return groups;
  }, []);

  // Filtered list for search
  const filteredStudios = useMemo(() => {
    if (!searchQuery.trim()) return studiosData;
    return studiosData.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [searchQuery]);

  const popularStudios = useMemo(() => {
    return studiosData.filter((s) => s.popular);
  }, []);

  const createStudioSlug = (name, id) => {
    return `${name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")}-${id}`;
  };

  const StudioCard = ({ studio }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="group relative"
    >
      <Link href={`/studio/${studio.id}`}>
        <div className="bg-white rounded-2xl p-6 h-48 flex flex-col items-center justify-between shadow-xl transition-all border border-gray-100 hover:border-primary/50">
          <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
            {studio.logo_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w300${studio.logo_path}`}
                alt={studio.name}
                className="max-w-full max-h-24 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
              />
            ) : (
              <div className="text-gray-400 font-bold text-2xl text-center">
                {studio.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-gray-900 font-bold font-comfortaa text-sm lg:text-base line-clamp-1">
              {studio.name}
            </h3>
            <p className="text-gray-500 text-xs font-poppins mt-1">
              {studio.country}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-poppins">
      <Navbar />

      <main className=" mx-auto px-4 lg:px-[3vw] py-[150px] lg:py-[10vw]">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold font-comfortaa mb-2">
              Studio<span className="text-primary">Hub</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Explore production houses from all over the world
            </p>
          </div>

          <div className="relative w-full md:w-[400px]">
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex items-center gap-4 focus-within:border-primary/50 transition-all">
              <SearchIcon className="text-gray-400 size-5" />
              <input
                type="text"
                placeholder="Search studios..."
                className="bg-transparent border-none outline-none text-white w-full font-poppins"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {searchQuery.trim() ? (
            <motion.div
              key="search-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
            >
              {filteredStudios.map((studio) => (
                <StudioCard key={studio.id} studio={studio} />
              ))}
              {filteredStudios.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-500">
                  No studios found matching "{searchQuery}"
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="default-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              {/* Popular Studios */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  {/* <Star className="text-primary fill-primary size-6" /> */}
                  <h2 className="text-2xl font-bold font-comfortaa">Featured Studios</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {popularStudios.map((studio) => (
                    <StudioCard key={studio.id} studio={studio} />
                  ))}
                </div>
              </section>

              {/* By Country */}
              {Object.entries(groupedByCountry).map(([country, studios]) => (
                <section key={country}>
                  <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
                    <Globe className="text-gray-400 size-6" />
                    <h2 className="text-2xl font-bold font-comfortaa">{country}</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {studios.map((studio) => (
                      <StudioCard key={studio.id} studio={studio} />
                    ))}
                  </div>
                </section>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style jsx global>{`
        .grayscale {
          filter: grayscale(100%);
        }
        .grayscale-0 {
          filter: grayscale(0%);
        }
      `}</style>
    </div>
  );
};

export default StudiosContent;
