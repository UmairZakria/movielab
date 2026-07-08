import StudiosContent from "./StudiosContent";
import { studiosData } from "@/lib/studiosData";

export const metadata = {
  title: "Studios Directory | MovieLab",
  description: "Browse movies and TV shows from the world's leading production studios and houses.",
  alternates: {
    canonical: "https://movies.umairlab.com/studios",
  },
  openGraph: {
    title: "Studios Directory | MovieLab",
    description: "Browse movies and TV shows from the world's leading production studios and houses.",
    url: "https://movies.umairlab.com/studios",
    siteName: "MovieLab",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Studios Directory | MovieLab",
    description: "Browse movies and TV shows from the world's leading production studios and houses.",
  },
};

export default function StudiosPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Production Studios Directory",
    "description": "Browse movies and TV shows from the world's leading production studios and houses.",
    "url": "https://movies.umairlab.com/studios",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": studiosData.map((studio, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": `https://movies.umairlab.com/studio/${studio.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")}-${studio.id}`,
        "item": {
          "@type": "Organization",
          "name": studio.name,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <StudiosContent />
    </>
  );
}
