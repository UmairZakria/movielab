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

    const description = `${name} is a ${department}. ${bio.substring(0, 200)}... Watch ${name}'s movies and series online free on MovieLab.`;

    return {
      title: `${name} - Movies, TV Series & Biography | MovieLab`,
      description,
      alternates: {
        canonical: `https://movies.umairlab.com/actor/${canonicalSlug}`,
      },
      openGraph: {
        title: `${name} | MovieLab - Biography, Movies & TV Shows`,
        description,
        url: `https://movies.umairlab.com/actor/${canonicalSlug}`,
        siteName: "MovieLab",
        images: primaryImage
          ? [{
              url: `https://image.tmdb.org/t/p/w500${primaryImage}`,
              width: 500,
              height: 750,
              alt: `${name} profile photo`,
            }]
          : [{
              url: "https://movies.umairlab.com/og-image.jpg",
              width: 1200,
              height: 630,
              alt: "MovieLab - Free Movie Streaming",
            }],
        type: "profile",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} | MovieLab`,
        description,
        images: primaryImage ? [`https://image.tmdb.org/t/p/w500${primaryImage}`] : [],
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
    return { title: "Actor Details | MovieLab" };
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
    "url": `https://movies.umairlab.com/actor/${slug}`,
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
        "item": "https://movies.umairlab.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Actors",
        "item": "https://movies.umairlab.com/actors"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": name,
        "item": `https://movies.umairlab.com/actor/${slug}`
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
