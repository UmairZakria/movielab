import WatchContent from "./WatchContent";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

async function getWatchTMDBData(mediaType, id) {
  const url = `${BASE_URL}/${mediaType}/${id}?api_key=${API_KEY}&append_to_response=credits,videos,keywords,release_dates,external_ids,recommendations,similar`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch watch data: ${res.statusText}`);
  }
  return res.json();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const id = slug?.split("-").pop();
  const isTV = slug?.startsWith("tv-");
  const mediaType = isTV ? "tv" : "movie";

  try {
    const data = await getWatchTMDBData(mediaType, id);
    const title = data.title || data.name;
    const overview = data.overview || "";
    const backdrop = data.backdrop_path;
    const poster = data.poster_path;
    const releaseDate = data.release_date || data.first_air_date || "";
    const year = releaseDate ? new Date(releaseDate).getFullYear() : "";
    const voteAverage = data.vote_average || 0;
    const voteCount = data.vote_count || 0;

    // Enhanced SEO description
    const genreNames = data.genres
      ? data.genres.map((g) => g.name).join(", ")
      : "Entertainment";

    const director = data.credits?.crew?.find(
      (person) => person.job === "Director",
    )?.name;

    const topActors = data.credits?.cast
      ?.slice(0, 3)
      .map((actor) => actor.name)
      .join(", ");

    const prefix = `Watch ${title} (${year})${director ? ` directed by ${director}` : ""} online free. `;
    const storyBrief = overview ? `${overview.substring(0, 120)}... ` : "";
    const castInfo = topActors ? `Starring ${topActors}. ` : "";
    const genreInfo = `${genreNames} ${mediaType === "tv" ? "series" : "film"}, rated ${voteAverage.toFixed(1)}/10. `;
    const suffix = `Stream in HD 1080p on Movieslab — no registration, no ads.`;

    let description = `${prefix}${storyBrief}${castInfo}${genreInfo}${suffix}`;
    if (description.length > 200) {
      description = description.substring(0, 197) + "...";
    }

    const titleStr = isTV
      ? `Watch ${title} (${year}) Full TV Series Free`
      : `Watch ${title} (${year}) Full Movie Free`;

    return {
      title: titleStr,
      description: description,
      authors: director ? [director] : [],
      creator: director || "Movieslab",
      publisher: "Movieslab",
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      alternates: {
        canonical: `https://movieslab.online/movie/${slug}`,
      },
      openGraph: {
        title: titleStr,
        description: description,
        url: `https://movieslab.online/movie/${slug}`,
        siteName: "Movieslab",
        images: [
          {
            url: `https://image.tmdb.org/t/p/original${backdrop}`,
            width: 1920,
            height: 1080,
            alt: `${title} full movie backdrop`,
          },
          {
            url: `https://image.tmdb.org/t/p/w500${poster}`,
            width: 500,
            height: 750,
            alt: `${title} movie poster`,
          },
        ],
        type: isTV ? "video.tv_show" : "video.movie",
        locale: "en_US",
        videos: data.videos?.results?.find(
          (v) => v.type === "Trailer" && v.site === "YouTube",
        )
          ? [
              {
                url: `https://www.youtube.com/watch?v=${data.videos.results.find((v) => v.type === "Trailer" && v.site === "YouTube").key}`,
                type: "text/html",
                "name": `${title} Official Trailer`,
                "description": `Watch the official trailer for ${title}`,
                uploadDate: data.release_date || data.first_air_date,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: titleStr,
        description: description,
        images: [`https://image.tmdb.org/t/p/original${backdrop}`],
      },
      robots: {
        index: false,
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: "Watch Movie Free | Movieslab",
      description:
        "Watch movies and TV shows online for free on Movieslab. Stream in HD quality with no ads.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }
}

export default async function Page({ params, searchParams }) {
  const { slug } = await params;
  const search = await searchParams;
  const initialServerId = search?.server;
  const id = slug?.split("-").pop();
  const isTV = slug?.startsWith("tv-");
  const mediaType = isTV ? "tv" : "movie";

  let initialData = null;
  try {
    initialData = await getWatchTMDBData(mediaType, id);
  } catch (error) {
    console.error("Failed to fetch initial data for watch page on server:", error);
  }

  const title = initialData ? (initialData.title || initialData.name) : "Movie/TV Show";
  const releaseDate = initialData ? (initialData.release_date || initialData.first_air_date || "") : "";
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "";

  const videoSchemaMarkup = initialData ? {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": `Watch ${title} (${year}) Online Free`,
    "description": initialData.overview || "",
    "thumbnailUrl": initialData.poster_path ? `https://image.tmdb.org/t/p/w500${initialData.poster_path}` : undefined,
    "uploadDate": initialData.release_date || initialData.first_air_date,
    "contentUrl": `https://movieslab.online/movie/${slug}`,
    "embedUrl": `https://movieslab.online/watch/${slug}`
  } : null;

  const breadcrumbMarkup = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://movieslab.online"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": isTV ? "TV Series" : "Movies",
        "item": isTV ? "https://movieslab.online/discover/web-series" : "https://movieslab.online/discover/trending"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `Watch ${title}`,
        "item": `https://movieslab.online/watch/${slug}`
      }
    ]
  };

  return (
    <>
      {videoSchemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchemaMarkup) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbMarkup) }}
      />
      <WatchContent
        initialData={initialData}
        slug={slug}
        id={id}
        mediaType={mediaType}
        initialServerId={initialServerId}
      />
    </>
  );
}
