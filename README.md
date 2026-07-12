# 🎬 MovieLab

Movie discovery and streaming platform. Browse trending movies and TV shows, view details, and watch via third-party embed providers. Built with **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS v4**.

## Features

- **Movie/TV Discovery** — Browse by trending, top-rated, genre, country, studio, actor, and curated hubs (Hollywood, Bollywood, Korean, Anime)
- **Detail Pages** — Movie/TV info with cast, crew, trailers, reviews, recommendations, and storyline
- **Embed Player** — `/watch/[slug]` page with server switcher (4 embed providers), episode playlist for TV series, and fullscreen support
- **Search** — Global search with suggestions via Navbar
- **Watch Later & History** — localStorage-based saved list and watch history tracking
- **Login System** — `/login` page with hardcoded credentials. Logged-in users get an ad-free experience; non-logged-in users get periodic popup ads on navigation
- **SEO** — Dynamic `generateMetadata` on every page, JSON-LD structured data (Movie, TVSeries, Person, VideoObject, BreadcrumbList, CollectionPage), sitemap index with 3 sub-sitemaps, Open Graph + Twitter cards
- **Analytics** — Microsoft Clarity session recording
- **Smooth Scrolling** — Lenis + GSAP on desktop, CSS scroll-behavior on mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Animations | Framer Motion, GSAP, Lenis |
| Icons | Lucide React |
| Data Source | TMDB API (via axios + native fetch) |
| Carousel | react-slick |
| Analytics | Microsoft Clarity |

## Getting Started

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_TMDB_KEY=your_tmdb_api_key
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
```

Run:

```bash
npm run dev       # Development
npm run build     # Production build
npm start         # Start production server
```

## Project Structure

```
app/
├── actors/           # Actor listings + profiles
├── components/       # Shared UI (Navbar, Hero, MovieRow, Reviews, modals, etc.)
├── contact/          # Static pages (about, contact, privacy)
├── countries/        # Browse by country
├── discover/[slug]/  # Genre/hub filtering pages
├── history/          # Watch history
├── login/            # Admin login
├── movie/[slug]/     # Movie/TV detail pages
├── search/[query]/   # Search results
├── studio/[id]/      # Studio/company pages
├── watch/[slug]/     # Video player (embed)
├── watch-later/      # Saved list
├── sitemap.xml/      # Sitemap index
├── movies.xml/       # Movie sitemap
├── webseries.xml/    # TV sitemap
├── static.xml/       # Static pages sitemap
├── utils/            # Analytics helpers
├── layout.js         # Root layout
├── page.js           # Homepage
├── globals.css       # Tailwind v4 + theme
├── robots.js         # robots.txt
context/
└── AuthContext.js    # Watch Later state
└── AdContext.js      # Login + ad injection
lib/
└── studiosData.js    # Studio directory data
```



Made by [Umair](https://umairlab.com)
