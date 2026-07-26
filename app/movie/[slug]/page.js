import MovieContent from "./MovieContent";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

async function getTMDBData(mediaType, id, appendToResponse = "") {
  const url = `${BASE_URL}/${mediaType}/${id}?api_key=${API_KEY}${appendToResponse ? `&append_to_response=${appendToResponse}` : ""}`;
  const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
  if (!res.ok) {
    throw new Error(`Failed to fetch TMDB data: ${res.statusText}`);
  }
  return res.json();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const id = slug?.split("-").pop();
  const isTV = slug?.startsWith("tv-");
  const mediaType = isTV ? "tv" : "movie";

  try {
    const data = await getTMDBData(
      mediaType,
      id,
      "keywords,credits,external_ids,release_dates,watch/providers,videos",
    );

    const title = data.title || data.name;
    const overview = data.overview || "";
    const backdrop = data.backdrop_path;
    const poster = data.poster_path;
    const releaseDate = data.release_date || data.first_air_date || "";
    const year = releaseDate ? new Date(releaseDate).getFullYear() : "";
    const runtime = data.runtime || data.episode_run_time?.[0] || 0;
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

    const prefix = `Watch ${title} (${year})${director ? ` directed by ${director}` : ""} full ${mediaType === "tv" ? "series" : "movie"} online free. `;
    const storyBrief = overview ? `${overview.substring(0, 120)}... ` : "";
    const castInfo = topActors ? `Starring ${topActors}. ` : "";
    const genreInfo = `A ${genreNames} ${mediaType === "tv" ? "series" : "film"} with a ${voteAverage.toFixed(1)}/10 rating. `;
    const suffix = `Stream in HD 1080p on Movieslab — free, no registration, no ads.`;

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
        // TMDB absolute URLs. Backdrop (1920x1080) is the primary card
        // image — wide enough for every social platform. The poster
        // (500x750) is intentionally omitted from og.images because it
        // fails the 600px minimum on LinkedIn/Twitter/WhatsApp and was
        // causing some platforms to render a blank/white box.
        images: backdrop
          ? [{ url: `https://image.tmdb.org/t/p/original${backdrop}`, alt: `${title} backdrop` }]
          : poster
          ? [{ url: `https://image.tmdb.org/t/p/original${poster}`, alt: `${title} poster` }]
          : [],
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
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  } catch (error) {
    return {
      title: "Watch Movies Free | Movieslab",
      description:
        "Watch movies and TV shows online for free on Movieslab. Stream in HD quality with no ads.",
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

export default async function Page({ params }) {
  const { slug } = await params;
  const id = slug?.split("-").pop();
  const isTV = slug?.startsWith("tv-");
  const mediaType = isTV ? "tv" : "movie";

  let initialData = null;
  try {
    initialData = await getTMDBData(
      mediaType,
      id,
      "videos,credits,keywords,release_dates,external_ids",
    );
  } catch (error) {
    console.error("Failed to fetch initial data for movie/tv on server:", error);
  }

  const title = initialData ? (initialData.title || initialData.name) : "Movie/TV Show";
  const releaseDate = initialData ? (initialData.release_date || initialData.first_air_date || "") : "";
  const year = releaseDate ? new Date(releaseDate).getFullYear() : "";

  const schemaMarkup = initialData ? (isTV 
    ? {
        "@context": "https://schema.org",
        "@type": "TVSeries",
        "name": initialData.name,
        "description": initialData.overview || "",
        "image": initialData.poster_path ? `https://image.tmdb.org/t/p/w500${initialData.poster_path}` : undefined,
        "dateCreated": initialData.first_air_date,
        "aggregateRating": initialData.vote_count > 0 ? {
          "@type": "AggregateRating",
          "ratingValue": initialData.vote_average,
          "ratingCount": initialData.vote_count,
          "bestRating": 10,
          "worstRating": 1
        } : undefined
      }
    : {
        "@context": "https://schema.org",
        "@type": "Movie",
        "name": initialData.title,
        "description": initialData.overview || "",
        "image": initialData.poster_path ? `https://image.tmdb.org/t/p/w500${initialData.poster_path}` : undefined,
        "datePublished": initialData.release_date,
        "director": initialData.credits?.crew
          ?.filter(c => c.job === "Director")
          .map(d => ({ "@type": "Person", "name": d.name })),
        "actor": initialData.credits?.cast?.slice(0, 5).map(a => ({ "@type": "Person", "name": a.name })),
        "aggregateRating": initialData.vote_count > 0 ? {
          "@type": "AggregateRating",
          "ratingValue": initialData.vote_average,
          "ratingCount": initialData.vote_count,
          "bestRating": 10,
          "worstRating": 1
        } : undefined
      }) : null;

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
        "name": title,
        "item": `https://movieslab.online/movie/${slug}`
      }
    ]
  };

  const faqMarkup = initialData ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Where can I watch ${title} (${year}) online for free?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `You can watch ${title} (${year}) online for free in HD 1080p on Movieslab. No registration or subscription required.`
        }
      },
      {
        "@type": "Question",
        "name": `Is ${title} available in HD quality?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, ${title} is available to stream in Full HD 1080p quality on Movieslab.`
        }
      },
      {
        "@type": "Question",
        "name": `Can I watch ${title} for free?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Movieslab offers free streaming of ${title} (${year}) in HD quality. You can watch online instantly without any downloads or sign-ups.`
        }
      },
      {
        "@type": "Question",
        "name": `Who stars in ${title}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${title} features ${initialData.credits?.cast?.slice(0, 3).map(a => a.name).join(", ") || "a talented cast"}${initialData.credits?.cast?.length > 3 ? " and many more" : ""}.`
        }
      }
    ]
  } : null;

  return (
    <>
      {schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbMarkup) }}
      />
      {faqMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqMarkup) }}
        />
      )}
      <MovieContent
        initialData={initialData}
        slug={slug}
        id={id}
        mediaType={mediaType}
      />
    </>
  );
}
