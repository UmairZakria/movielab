import ActorContent from "./ActorContent";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

async function getActorData(id) {
  const url = `${BASE_URL}/person/${id}?api_key=${API_KEY}&append_to_response=combined_credits,images,external_ids`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    throw new Error(`Failed to fetch actor data: ${res.statusText}`);
  }
  return res.json();
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const id = slug?.split("-").pop();

  try {
    const data = await getActorData(id);
    const name = data.name;
    const bio = data.biography || "";
    const primaryImage = data.profile_path;
    const department = data.known_for_department || "Actor";
    const canonicalSlug = `${name.toLowerCase().replace(/[^\w]+/g, "-").replace(/--+/g, "-").replace(/^-|-$/g, "")}-${id}`;

    const description = `${name} is a ${department}. ${bio.substring(0, 200)}... Watch ${name}'s movies and series online free on Movieslab.`;

    // TMDB absolute URLs. Primary image is the actor's profile photo
    // (h500 path gives ~500x750 which is too small for some crawlers, so
    // we upgrade to /original to satisfy the 600px minimum). Fallback
    // is the actor's first known-for backdrop if no profile photo exists.
    const primaryImageUrl = primaryImage
      ? `https://image.tmdb.org/t/p/original${primaryImage}`
      : null;
    const fallbackImageUrl = data.combined_credits?.cast?.[0]?.backdrop_path
      ? `https://image.tmdb.org/t/p/original${data.combined_credits.cast[0].backdrop_path}`
      : null;

    return {
      title: `${name} - Movies & TV Series`,
      description,
      alternates: {
        canonical: `https://movieslab.online/actor/${canonicalSlug}`,
      },
      openGraph: {
        title: `${name} | Movieslab`,
        description,
        url: `https://movieslab.online/actor/${canonicalSlug}`,
        siteName: "Movieslab",
        ...(primaryImageUrl || fallbackImageUrl
          ? { images: [{ url: primaryImageUrl || fallbackImageUrl, alt: `${name} photo` }] }
          : {}),
        type: "profile",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} | Movieslab`,
        description,
        ...((primaryImageUrl || fallbackImageUrl)
          ? { images: [primaryImageUrl || fallbackImageUrl] }
          : {}),
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
    return { title: "Actor Details | Movieslab" };
  }
}

export default async function Page({ params }) {
  const { slug } = await params;
  const id = slug?.split("-").pop();

  let initialData = null;
  try {
    initialData = await getActorData(id);
  } catch (error) {
    console.error("Failed to fetch initial actor data on server:", error);
  }

  const name = initialData ? initialData.name : "Actor";
  const bio = initialData ? (initialData.biography || "") : "";
  const profilePath = initialData ? initialData.profile_path : "";

  const personSchemaMarkup = initialData ? {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "description": bio.substring(0, 160),
    "image": profilePath ? `https://image.tmdb.org/t/p/w500${profilePath}` : undefined,
    "jobTitle": initialData.known_for_department || "Actor/Actress",
    "birthDate": initialData.birthday || undefined,
    "birthPlace": initialData.place_of_birth ? {
      "@type": "Place",
      "name": initialData.place_of_birth
    } : undefined,
    "url": `https://movieslab.online/actor/${slug}`,
    "sameAs": initialData.external_ids ? [
      initialData.external_ids.imdb_id ? `https://www.imdb.com/name/${initialData.external_ids.imdb_id}` : null,
      initialData.external_ids.instagram_id ? `https://www.instagram.com/${initialData.external_ids.instagram_id}` : null,
      initialData.external_ids.twitter_id ? `https://twitter.com/${initialData.external_ids.twitter_id}` : null,
      initialData.external_ids.facebook_id ? `https://www.facebook.com/${initialData.external_ids.facebook_id}` : null,
    ].filter(Boolean) : undefined
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
        "name": "Actors",
        "item": "https://movieslab.online/actors"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": name,
        "item": `https://movieslab.online/actor/${slug}`
      }
    ]
  };

  return (
    <>
      {personSchemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchemaMarkup) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbMarkup) }}
      />
      <ActorContent data={initialData} slug={slug} />
    </>
  );
}
