import { cache } from "react";
import { etagFetch } from "@/lib/server/etagFetch";
import { authHeader } from "@/lib/server/locationCookie";

// Server-only fetchers for the seller page.
const apiUrl = (path) =>
  `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}${path}`;

// cache() shares one request across generateMetadata, profile and reviews.
export const getSellerData = cache(async (id, langCode, page = 1) => {
  const empty = { notFound: false, seller: null, ratings: null, ratingsCount: {} };
  try {
    const params = new URLSearchParams({ id, page });
    const json = await etagFetch(apiUrl(`get-seller?${params}`), {
      key: `seller:${langCode || "en"}:${params.toString()}`,
      headers: {
        "Content-Language": langCode || "en",
        ...(await authHeader()),
      },
    });

    // 103 = no such user. Distinct from a failed request, which must not
    // render the "no seller found" empty state.
    if (json?.error && json?.code === 103) return { ...empty, notFound: true };

    return {
      notFound: false,
      seller: json?.data?.seller || null,
      ratings: json?.data?.ratings || null,
      ratingsCount: json?.data?.ratings_count || {},
    };
  } catch (error) {
    console.error("Error fetching seller data:", error);
    return empty;
  }
});

// Same endpoint the client load-more calls, so appended pages line up with the
// server-rendered first page.
export const getSellerItems = cache(
  async ({ id, langCode, sortBy, page = 1 }) => {
    try {
      const params = new URLSearchParams({
        user_id: id,
        page,
        limit: 12,
        ...(sortBy && sortBy !== "default" && { sort_by: sortBy }),
      });
      const json = await etagFetch(apiUrl(`get-item-list?${params}`), {
        key: `seller-items:${langCode || "en"}:${params.toString()}`,
        headers: {
          "Content-Language": langCode || "en",
          ...(await authHeader()),
        },
      });
      return json?.data || null;
    } catch (error) {
      console.error("Error fetching seller items:", error);
      return null;
    }
  }
);
