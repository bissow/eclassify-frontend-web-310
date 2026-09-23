import { cookies, headers } from "next/headers";
import { LOCATION_COOKIE, SEED_COOKIE, SEED_HEADER } from "@/lib/constants";

// Server-only reader for the location cookie written client-side by
// lib/location.js. Carries area/areaId/city/state/country/lat/long/kmRange
// (ads/featured API params + useLanguageSync's area-translation refresh) and
// formattedAddress (HomeHeader/MapLocation display text).
// Returns null when the visitor has never picked a location (crawlers,
// first-time visitors) — callers should fetch without location params then.
export const getLocationCookie = async () => {
  try {
    const raw = (await cookies()).get(LOCATION_COOKIE)?.value;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error parsing location cookie:", error);
    return null;
  }
};

// Reads the auth token cookie (mirrored from redux by useClientLayoutLogic) so
// server fetches can forward it for personalized fields like is_liked. Returns
// {} for guests — those requests stay anonymous and shared-cacheable. Passing
// an Authorization header makes etagFetch bypass its shared cache (see there).
export const authHeader = async () => {
  const token = (await cookies()).get("token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Per-session seed for get-reels, minted in proxy.js. Header first — a cookie the
// proxy set on the response isn't readable via cookies() during that same render,
// so a first-time visitor would otherwise fetch reels unseeded. Cookie is the
// fallback for paths the proxy matcher skips.
// Returns {} when authenticated: the backend seeds off the user then. Passing the
// header makes etagFetch bypass its shared cache, same as Authorization.
export const seedHeader = async (isAuthed = false) => {
  if (isAuthed) return {};
  const seed =
    (await headers()).get(SEED_HEADER) ||
    (await cookies()).get(SEED_COOKIE)?.value;
  return seed ? { [SEED_HEADER]: seed } : {};
};

// Shared by AllItemsSection/FeaturedSectionsSection/ExploreVideosSection —
// same radius-or-hierarchy fallback the client fetches always used.
export const buildLocationParams = (location) => {
  const params = {};
  if (!location) return params;
  const kmRange = Number(location.kmRange) || 0;
  if (kmRange > 0 && (location.areaId || location.city)) {
    params.radius = kmRange;
    params.latitude = location.lat;
    params.longitude = location.long;
  } else if (location.areaId) {
    params.area_id = location.areaId;
  } else if (location.city) {
    params.city = location.city;
  } else if (location.state) {
    params.state = location.state;
  } else if (location.country) {
    params.country = location.country;
  }
  return params;
};
