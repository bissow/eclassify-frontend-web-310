import OffersDirectory from "@/features/offers/OffersDirectory";

export const dynamic = "force-dynamic";

export const generateMetadata = async () => {
  return {
    title: "Offers, Sales & Promotions | Eclassify",
    description: "Discover exclusive flash sales, deals of the day, clearance discounts, and seasonal campaigns in your area.",
  };
};

export default function OffersPage() {
  return <OffersDirectory />;
}
