import CampaignDetail from "@/features/offers/CampaignDetail";

export const dynamic = "force-dynamic";

export default function CampaignPage({ params }) {
  return <CampaignDetail params={params} />;
}
