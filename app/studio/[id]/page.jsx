import StudioContent from "./StudioContent";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Studio Production | MovieLab`,
    description: `Explore movies and TV shows produced by this studio on MovieLab.`,
  };
}

export default async function StudioPage({ params }) {
  const { id } = await params;
  return <StudioContent studioId={id} />;
}
