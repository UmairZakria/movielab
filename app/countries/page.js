import React from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

// List of major countries to display first
const MAJOR_COUNTRIES = [
  "United States of America",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Italy",
  "Spain",
  "South Korea",
  "India",
  "China",
  "Brazil",
  "Mexico",
  "Russia",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
];

export const metadata = {
  title: "Watch Movies & TV Shows by Country | MovieLab",
  description: "Browse and watch free movies and TV shows from around the world. Stream in HD 1080p from United States, United Kingdom, Korea, India, and more on MovieLab (movieslab.io).",
  alternates: {
    canonical: "https://movies.umairlab.com/countries",
  },
};

async function getCountries() {
  const url = `${BASE_URL}/configuration/countries?api_key=${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 86400 } }); // Cache for 24 hours
  if (!res.ok) {
    throw new Error(`Failed to fetch countries: ${res.statusText}`);
  }
  return res.json();
}

export default async function CountriesPage() {
  let countries = [];
  try {
    const rawCountries = await getCountries();
    const mapped = rawCountries.map((c) => ({
      code: c.iso_3166_1,
      name: c.english_name,
    }));

    const major = mapped.filter((c) => MAJOR_COUNTRIES.includes(c.name));
    const other = mapped.filter((c) => !MAJOR_COUNTRIES.includes(c.name));

    const sortedMajor = major.sort((a, b) => {
      const aIndex = MAJOR_COUNTRIES.indexOf(a.name);
      const bIndex = MAJOR_COUNTRIES.indexOf(b.name);
      return aIndex - bIndex;
    });

    const sortedOther = other.sort((a, b) => a.name.localeCompare(b.name));
    countries = [...sortedMajor, ...sortedOther];
  } catch (error) {
    console.error("Error loading countries:", error);
  }

  return (
    <main className="w-full min-h-screen bg-black text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Browse Movies by Country",
            "description": "Browse and watch free movies and TV shows from around the world on MovieLab.",
            "url": "https://movies.umairlab.com/countries",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": countries.map((c, i) => ({
                "@type": "ListItem",
                "position": i + 1,
                "url": `https://movies.umairlab.com/discover/country-${c.name.toLowerCase().replace(/ /g, "-")}-${c.code}`,
              })),
            },
          }),
        }}
      />
      <Navbar />
      <div className="px-4 lg:px-[5vw] md:py-[10vw] py-[40vw]">
        <h1 className="text-2xl lg:text-3xl font-comfortaa font-bold mb-8">
          Browse by Country
        </h1>
        {countries.length === 0 ? (
          <div className="py-20 text-center text-gray-500 italic">
            Failed to load countries. Please check your connection.
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-start gap-4 lg:gap-[2vw]">
            {countries.map((country) => {
              const flagUrl = `https://flagcdn.com/w40/${country.code.toLowerCase()}.png`;
              return (
                <Link
                  key={country.code}
                  href={`/discover/country-${country.name.toLowerCase().replace(/ /g, "-")}-${country.code}`}
                  className="group bg-zinc-900/40 rounded-2xl p-4 transition-all flex items-center gap-4 hover:bg-zinc-800/60"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-black transition-all overflow-hidden">
                    <img
                      src={flagUrl}
                      alt={`${country.name} flag`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">
                    {country.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
