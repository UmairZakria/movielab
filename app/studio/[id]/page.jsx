import StudioContent from "./StudioContent";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await fetch(
      `${BASE_URL}/company/${id}?api_key=${API_KEY}`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) throw new Error("Failed to fetch studio");
    const data = await res.json();
    const name = data.name || "Studio";
    // TMDB absolute URL — use the studio's own logo if available so each
    // studio page gets a relevant preview. Falls back to the root poster
    // for the very small number of studios with no logo on TMDB.
    const studioLogo = data.logo_path
      ? `https://image.tmdb.org/t/p/original${data.logo_path}`
      : null;
    return {
      title: `${name} - Movies & TV Series`,
      description: `Explore movies and TV shows produced by ${name}. Stream in HD 1080p free on Movieslab.`,
      alternates: {
        canonical: `https://movieslab.online/studio/${id}`,
      },
      openGraph: {
        title: `${name} - Movies & TV Series | Movieslab`,
        description: `Explore movies and TV shows produced by ${name}. Stream in HD 1080p free on Movieslab.`,
        url: `https://movieslab.online/studio/${id}`,
        siteName: "Movieslab",
        ...(studioLogo && { images: [{ url: studioLogo, alt: `${name} logo` }] }),
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} - Movies & TV Series | Movieslab`,
        description: `Explore movies and TV shows produced by ${name}. Stream in HD 1080p free on Movieslab.`,
        ...(studioLogo && { images: [studioLogo] }),
      },
    };
  } catch (error) {
    return {
      title: "Studio Production | Movieslab",
      description: "Explore movies and TV shows produced by this studio on Movieslab.",
    };
  }
}

export default async function StudioPage({ params }) {
  const { id } = await params;
  return <StudioContent studioId={id} />;
}
