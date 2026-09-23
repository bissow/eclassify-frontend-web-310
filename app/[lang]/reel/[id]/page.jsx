import ReelPlayer from "@/features/reels/ReelPlayer";

export const dynamic = "force-dynamic";

const ReelPage = async ({ params }) => {
  const { id } = await params;
  return <ReelPlayer initialId={id === "latest" ? undefined : id} />;
};

export default ReelPage;
