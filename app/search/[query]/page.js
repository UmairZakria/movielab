import SearchContent from "./SearchContent";

export async function generateMetadata({ params }) {
  const { query } = await params;
  const decodedQuery = decodeURIComponent(query);

  const title = `Search "${decodedQuery}" - Movieslab`;
  const description = `Search results for "${decodedQuery}" on Movieslab. Find movies and TV series to stream free in HD.`;

  return {
    title: title,
    description: description,
    alternates: {
      canonical: `https://movieslab.online/search/${query}`,
    },
    openGraph: {
      title: title,
      description: description,
      url: `https://movieslab.online/search/${query}`,
      siteName: "Movieslab",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function Page({ params }) {
  const { query } = await params;
  return <SearchContent query={query} />;
}
