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

    const prefix = `Watch ${title} (${year})${director ? ` directed by ${director}` : ""} Full ${mediaType === "tv" ? "Series" : "Movie"} Online Free. `;
    const storyBrief = overview ? `${overview.substring(0, 120)}... ` : "";
    const castInfo = topActors ? `Starring ${topActors}. ` : "";
    const genreInfo = `A ${genreNames} ${mediaType === "tv" ? "series" : "film"} with ${voteAverage.toFixed(1)}/10 rating from ${voteCount.toLocaleString()} votes. `;
    const suffix = `Stream ${title} in HD 1080p on MovieLab (movieslab.io / movies umairlab) with zero ads, fast buffering, and no registration required. Watch free movies and web series online.`;

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
        url: `https://movies.umairlab.com/movie/${slug}`,
        siteName: "MovieLab",
        images: [
          {
            url: `https://image.tmdb.org/t/p/original${backdrop}`,
            width: 1920,
            height: 1080,
            alt: `Watch ${title} Full Movie HD Backdrop`,
          },
          {
            url: `https://image.tmdb.org/t/p/w500${poster}`,
            width: 500,
            height: 750,
            alt: `${title} Movie Poster`,
          },
        ],
        type: isTV ? "video.tv_show" : "video.movie",
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
      verification: {
        google: "VBh8Z5n2gYt-blPxDnyzDu5KU9JOBHYSdaEZmv-s3bk",
        yandex: "03632b5675884ef5",
      },
    };
  } catch (error) {
    return {
      title: "Movie Details | MovieLab - Watch Movies Online Free",
      description:
        "Watch movies and TV shows online for free on MovieLab. Stream in HD quality with no ads and fast buffering.",
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
        "dateCreated": initialData.release_date,
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
        "name": title,
        "item": `https://movies.umairlab.com/movie/${slug}`
      }
    ]
  };

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
      <MovieContent
        initialData={initialData}
        slug={slug}
        id={id}
        mediaType={mediaType}
      />
    </>
  );
}
