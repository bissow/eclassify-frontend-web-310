import { etagFetch } from "@/lib/server/etagFetch";
import {
  authHeader,
  buildLocationParams,
  getLocationCookie,
} from "@/lib/server/locationCookie";
import SimilarAds from "@/features/ad-details/SimilarAds";

// Location comes from the cookie rather than localStorage so the carousel can
// render server-side — same source AllItemsSection uses on home.
const getSimilarAds = async ({ categoryId, itemId, langCode }) => {
  try {
    const location = await getLocationCookie();
    const params = new URLSearchParams({
      category_id: String(categoryId),
      excluded_item_id: String(itemId),
      ...buildLocationParams(location),
    });
    const json = await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-item-list?${params}`,
      {
        key: `similar-ads:${langCode || "en"}:${params.toString()}`,
        headers: {
          "Content-Language": langCode || "en",
          ...(await authHeader()),
        },
      }
    );
    return json?.data?.data || [];
  } catch (error) {
    console.error("Error fetching similar ads:", error);
    return [];
  }
};

const SimilarAdsSection = async ({
  categoryId,
  itemId,
  langCode,
  aboveBanners,
  belowBanners,
}) => {
  if (!categoryId) return null;

  const items = await getSimilarAds({ categoryId, itemId, langCode });
  if (!items.length) return null;

  return (
    <SimilarAds
      initialItems={items}
      aboveBanners={aboveBanners}
      belowBanners={belowBanners}
    />
  );
};

export default SimilarAdsSection;
