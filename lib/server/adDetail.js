import { cache } from "react";
import { etagFetch } from "./etagFetch";
import { authHeader } from "./locationCookie";

const apiUrl = (path) =>
  `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${path}`;

// cache() → generateMetadata and the page body share one request.
// Cookie token makes the personalized fields (is_liked, is_already_reported,
// is_already_offered, is_purchased) correct in the first byte; etagFetch skips
// its shared store whenever an Authorization header is present.
export const getItemData = cache(async (slug, langCode) => {
  try {
    const json = await etagFetch(apiUrl(`get-item-list?slug=${slug}`), {
      key: `item:${langCode || "en"}:${slug}`,
      headers: {
        "Content-Language": langCode || "en",
        ...(await authHeader()),
      },
    });
    // Single-item form returns the item at `data` — the `data.data` envelope
    // only applies to the paginated list form.
    return json?.data || null;
  } catch (error) {
    console.error("Error fetching item data:", error);
    return null;
  }
});

// Owner view. Always authenticated — without a token the API has no way to
// know whose listing this is, so a missing cookie legitimately yields null.
export const getMyItemData = cache(async (slug, langCode) => {
  try {
    const auth = await authHeader();
    if (!auth.Authorization) return null;
    const json = await etagFetch(apiUrl(`my-items?slug=${slug}`), {
      key: `my-item:${langCode || "en"}:${slug}`,
      headers: { "Content-Language": langCode || "en", ...auth },
    });
    return json?.data || null;
  } catch (error) {
    console.error("Error fetching my item data:", error);
    return null;
  }
});

export const getDetailBannerAds = cache(async (langCode) => {
  try {
    const params = new URLSearchParams({ platform: "web", page: "detail" });
    const json = await etagFetch(apiUrl(`get-banner-ads?${params}`), {
      key: `banner-ads:detail:${langCode || "en"}`,
      headers: { "Content-Language": langCode || "en" },
    });
    return json?.data || [];
  } catch (error) {
    console.error("Error fetching detail banner ads:", error);
    return [];
  }
});

// Same grouping the client useMemo did, moved server-side so the banners are
// in the initial HTML instead of popping in after mount.
export const buildDetailBannerMap = (bannerAds) => {
  if (!bannerAds?.length) return {};
  const grouped = {};
  for (const item of bannerAds) {
    const banner = Array.isArray(item) ? item[0] : item;
    if (!banner?.status || !banner.detail_page_section) continue;
    const isSideLayout =
      banner.layout === "single_side" || banner.layout === "dual_side";
    const key = isSideLayout
      ? banner.detail_page_section + "_side"
      : banner.detail_page_section + "_" + banner.placement;
    (grouped[key] ||= []).push(item);
  }
  return grouped;
};

export const getReelForItem = async ({ itemId, isMyListing, langCode }) => {
  if (!itemId) return null;
  try {
    const path = isMyListing ? "get-my-reels" : "get-reels";
    const json = await etagFetch(apiUrl(`${path}?item_id=${itemId}`), {
      key: `${path}:${langCode || "en"}:${itemId}`,
      headers: {
        "Content-Language": langCode || "en",
        ...(await authHeader()),
      },
    });
    return json?.data?.data?.[0] || null;
  } catch (error) {
    console.error("Error fetching reel data:", error);
    return null;
  }
};
