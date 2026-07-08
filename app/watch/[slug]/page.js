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

    const prefix = `Watch ${title} (${year})${director ? ` directed by ${director}` : ""} Full ${mediaType === "tv" ? "Series" : "Movie"} Online Live. `;
    const storyBrief = overview ? `${overview.substring(0, 120)}... ` : "";
    const castInfo = topActors ? `Starring ${topActors}. ` : "";
    const genreInfo = `Stream this ${genreNames} ${mediaType === "tv" ? "series" : "film"} with ${voteAverage.toFixed(1)}/10 rating from ${voteCount.toLocaleString()} votes. `;
    const suffix = `Watch ${title} in HD 1080p on MovieLab (movieslab.io / movies umairlab) with zero ads, instant playback, and no registration. Streaming free now.`;

    let description = `${prefix}${storyBrief}${castInfo}${genreInfo}${suffix}`;
    if (description.length > 320) {
      description = description.substring(0, 317) + "...";
    }

    const titleStr = isTV
      ? `Watch ${title} (${year}) Full TV Series Online Free HD | MovieLab`
      : `Watch ${title} (${year}) Full Movie Free Online HD | MovieLab`;

    return {
      title: titleStr,
      description: description,
      authors: director ? [director] : [],
      creator: director || "MovieLab",
      publisher: "MovieLab",
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      metadataBase: new URL("https://movies.umairlab.com"),
      alternates: {
        canonical: `https://movies.umairlab.com/movie/${slug}`,
      },
      openGraph: {
        title: titleStr,
        description: description,
        url: `https://movies.umairlab.com/watch/${slug}`,
        siteName: "MovieLab",
        images: [
          {
            url: `https://image.tmdb.org/t/p/original${backdrop}`,
            width: 1920,
            height: 1080,
            alt: `Watch ${title} Full Movie Live Stream`,
          },
          {
            url: `https://image.tmdb.org/t/p/w500${poster}`,
            width: 500,
            height: 750,
            alt: `${title} Movie Poster`,
          },
        ],
        type: isTV ? "video.episode" : "video.movie",
        locale: "en_US",
        countryName: "United States",
        videos: data.videos?.results?.find(
          (v) => v.type === "Trailer" && v.site === "YouTube",
        )
          ? [
              {
                url: `https://www.youtube.com/watch?v=${data.videos.results.find((v) => v.type === "Trailer" && v.site === "YouTube").key}`,
                type: "text/html",
                name: `${title} Official Trailer`,
                description: `Watch the official trailer for ${title}`,
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
        creator: "@MovieLab",
        site: "@MovieLab",
      },
      robots: {
        index: false, // Disallowed pages should not be indexed, though we still support canonical fallback
        follow: true,
      },
    };
  } catch (error) {
    return {
      title: "Watch Movie | MovieLab - Watch Movies Online Free",
      description:
        "Watch movies and TV shows online for free on MovieLab. Stream in HD quality with no ads and instant playback.",
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
    "contentUrl": `https://movies.umairlab.com/watch/${slug}`,
    "embedUrl": `https://movies.umairlab.com/watch/${slug}`
  } : null;

  const breadcrumbMarkup = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://movies.umairlab.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": isTV ? "TV Series" : "Movies",
        "item": isTV ? "https://movies.umairlab.com/discover/web-series" : "https://movies.umairlab.com/discover/trending"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `Watch ${title}`,
        "item": `https://movies.umairlab.com/watch/${slug}`
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
