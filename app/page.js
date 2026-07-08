import Home from "./components/Home";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;

export const metadata = {
  title: "MovieLab - Watch Free Movies & TV Series Online (1080p HD)",
  description:
    "Discover the latest trending movies, new releases, and curated collections on MovieLab. Your ultimate destination for entertainment.",
};

export default async function Page() {
  return (
    <>
      <Home initialData={{}} />
    </>
  );
}
