import StoreDetail from "@/features/stores/StoreDetail";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ")} | Store Profile | Eclassify`,
    description: `Discover products, contact details, and location for store ${slug}`,
  };
}

const SingleStorePage = async ({ params }) => {
  const { slug } = await params;
  return <StoreDetail slug={slug} />;
};

export default SingleStorePage;
