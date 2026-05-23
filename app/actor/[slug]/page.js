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

    return {
      title: `${name} - Movies, Series & Biography | MovieLab`,
      description: `${name} is a ${data.known_for_department}. ${bio.substring(0, 160)}... Watch ${name}'s movies and series online free on MovieLab.`,
      openGraph: {
        title: `${name} | MovieLab`,
        description: bio.substring(0, 160),
        images: [{ url: `https://image.tmdb.org/t/p/w500${primaryImage}` }],
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
    } : undefined
  } : null;

  return (
    <>
      {personSchemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchemaMarkup) }}
        />
      )}
      <ActorContent data={initialData} slug={slug} />
    </>
  );
}
