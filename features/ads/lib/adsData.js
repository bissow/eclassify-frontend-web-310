import { cache } from "react";
import { etagFetch } from "@/lib/server/etagFetch";
import { authHeader } from "@/lib/server/locationCookie";
import { knownParams } from "@/lib/constants";
import { toQueryString } from "@/lib/utils";

// Server-only fetchers for the ad listing pages (/ads, /ads/[...categorySlug],
// /ads/featured/[slug]). The URL query string is the single source of truth —
// buildItemListParams is the ONE place listing params are derived, and the
// resolved object is handed to the client for "load more" so page 2 can never
// drift from the server-rendered page 1.
const apiUrl = (path) =>
  `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${path}`;

export const ADS_PER_PAGE = 12;

// km_range is clamped to the range the admin configured, same as the client did
// via the settings slice (getMinRange/getMaxRange read min_length/max_length).
const clampKmRange = (raw, settings) => {
  const value = Number(raw);
  if (!raw || !(value > 0)) return "";
  const min = Number(settings?.data?.data?.min_length) || 0;
  const max = Number(settings?.data?.data?.max_length) || 100;
  return Math.min(Math.max(value, min), max);
};

// Every query param that isn't a known filter is a custom field, matching the
// client's useAdsFilters. Comma-joined values are multi-select.
const readCustomFields = (searchParams) => {
  const fields = {};
  for (const [key, value] of searchParams.entries()) {
    if (knownParams.includes(key)) continue;
    fields[key] = value.includes(",") ? value.split(",") : value;
  }
  return fields;
};

// The single param builder. `searchParams` is a URLSearchParams so the server
// (awaited page searchParams) and any client caller read it identically.
export const buildItemListParams = ({
  searchParams,
  leafSlug = null,
  featuredSlug = null,
  settings = null,
  page = 1,
}) => {
  const params = { page, limit: ADS_PER_PAGE };

  const sortBy = searchParams.get("sort_by") || "default";
  if (sortBy !== "default") params.sort_by = sortBy;

  // 0 is a legitimate minimum, so only an absent/blank value is skipped.
  const minPrice = searchParams.get("min_price");
  if (minPrice !== null && minPrice !== "" && Number(minPrice) >= 0) {
    params.min_price = Number(minPrice);
  }
  // Number() first: a non-numeric value is NaN and gets dropped, same as the
  // client's `if (max_price)` check on an already-Number()ed value.
  const maxPrice = Number(searchParams.get("max_price"));
  if (maxPrice) params.max_price = maxPrice;

  const datePosted = searchParams.get("date_posted");
  if (datePosted) params.posted_since = datePosted;

  if (leafSlug) params.category_slug = leafSlug;
  if (featuredSlug) params.featured_section_slug = featuredSlug;

  // JSON string, not an object: the API rejects bracket-nested params with
  // "The custom fields must be a string." Sending it pre-stringified also keeps
  // axios from re-serializing it on the client's load-more call.
  const customFields = readCustomFields(searchParams);
  if (Object.keys(customFields).length) {
    params.custom_fields = JSON.stringify(customFields);
  }

  // Radius search wins over the country/state/city/area hierarchy.
  const kmRange = clampKmRange(searchParams.get("km_range"), settings);
  if (Number(kmRange) > 0) {
    params.latitude = Number(searchParams.get("lat")) || undefined;
    params.longitude = Number(searchParams.get("lng")) || undefined;
    params.radius = kmRange;
  } else {
    const areaId = searchParams.get("areaId");
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const country = searchParams.get("country");
    if (areaId) params.area_id = areaId;
    else if (city) params.city = city;
    else if (state) params.state = state;
    else if (country) params.country = country;
  }

  const query = searchParams.get("query");
  if (query) params.search = query;

  return params;
};

// Identity of a result set. Used as the Suspense + remount key so a filter
// change streams fresh listings instead of React reusing the old instance.
export const paramsKey = (params) => toQueryString({ ...params, page: undefined });

// Cookie token makes is_liked correct in the first byte; etagFetch skips its
// shared store whenever an Authorization header is present.
export const getAdsItems = cache(async ({ langCode, query }) => {
  try {
    return await etagFetch(apiUrl(`get-item-list?${query}`), {
      key: `ads-items:${langCode || "en"}:${query}`,
      headers: {
        "Content-Language": langCode || "en",
        ...(await authHeader()),
      },
    });
  } catch (error) {
    console.error("Error fetching ads items:", error);
    return null;
  }
});

// One call serves three consumers on a category page: generateMetadata (SEO
// detail), the h1/breadcrumb (self_category) and the subcategory carousel's
// first page. cache() keeps it to a single request per render.
export const getCategoryBundle = cache(async (slug, langCode) => {
  try {
    const json = await etagFetch(apiUrl(`get-categories?slug=${slug}`), {
      key: `category:${langCode || "en"}:${slug}`,
      headers: { "Content-Language": langCode || "en" },
    });
    return {
      selfCategory: json?.self_category || null,
      seoDetail: json?.self_category?.seo_detail || null,
      subcategories: json?.data?.data || [],
      subCurrentPage: json?.data?.current_page || 1,
      subLastPage: json?.data?.last_page || 1,
    };
  } catch (error) {
    console.error("Error fetching category bundle:", error);
    return { selfCategory: null, seoDetail: null, subcategories: [], subCurrentPage: 1, subLastPage: 1 };
  }
});

// Ancestors root→leaf, e.g. [electronics, clothes]. Names come translated —
// self_category.path only carries slugs, which can't label a breadcrumb.
export const getCategoryTrail = cache(async (slug, langCode) => {
  try {
    const json = await etagFetch(
      apiUrl(`get-parent-categories?slug=${slug}&tree=0`),
      {
        key: `category-trail:${langCode || "en"}:${slug}`,
        headers: { "Content-Language": langCode || "en" },
      }
    );
    return json?.data || [];
  } catch (error) {
    console.error("Error fetching category trail:", error);
    return [];
  }
});

export const getCategoryCustomFields = cache(async (categoryId, langCode) => {
  if (!categoryId) return [];
  try {
    const json = await etagFetch(
      apiUrl(`get-customfields?category_id=${categoryId}&filter=true`),
      {
        key: `custom-fields:${langCode || "en"}:${categoryId}`,
        headers: { "Content-Language": langCode || "en" },
      }
    );
    return json?.data || [];
  } catch (error) {
    console.error("Error fetching category custom fields:", error);
    return [];
  }
});

// Serves both generateMetadata and the page body for /ads/featured/[slug].
// Returns null for an unknown slug — the API answers with an empty data array.
export const getFeaturedSection = cache(async (slug, langCode) => {
  try {
    const json = await etagFetch(apiUrl(`get-featured-section?slug=${slug}`), {
      key: `featured-section:${langCode || "en"}:${slug}`,
      headers: { "Content-Language": langCode || "en" },
    });
    return json?.data?.[0] || null;
  } catch (error) {
    console.error("Error fetching featured section:", error);
    return null;
  }
});

export const getListingBannerAds = cache(async (langCode) => {
  try {
    const params = new URLSearchParams({ platform: "web", page: "listing" });
    const json = await etagFetch(apiUrl(`get-banner-ads?${params}`), {
      key: `banner-ads:listing:${langCode || "en"}`,
      headers: { "Content-Language": langCode || "en" },
    });
    return json?.data || [];
  } catch (error) {
    console.error("Error fetching listing banner ads:", error);
    return [];
  }
});

// Same grouping the client useMemo did, moved server-side so the banners are in
// the initial HTML instead of popping in after mount. Side layouts have no
// placement — they are always sidebar, keyed by section + "_side".
export const buildListingBannerMap = (bannerAds) => {
  if (!bannerAds?.length) return {};
  const grouped = {};
  for (const item of bannerAds) {
    const banner = Array.isArray(item) ? item[0] : item;
    if (!banner?.status || !banner.listing_page_section) continue;
    const isSideLayout =
      banner.layout === "single_side" || banner.layout === "dual_side";
    const key = isSideLayout
      ? banner.listing_page_section + "_side"
      : banner.listing_page_section + "_" + banner.placement;
    (grouped[key] ||= []).push(item);
  }
  return grouped;
};
