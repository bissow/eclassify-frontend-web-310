import { buildLocationParams, getLocationCookie, seedHeader } from "@/lib/server/locationCookie";
import { etagFetch } from "@/lib/server/etagFetch";
import { EXPLORE_VIDEOS_PER_PAGE } from "@/lib/constants";
import ExploreVideos from "@/features/discovery/explore-videos/ExploreVideos";

const getReels = async (location, langCode) => {
  try {
    const params = new URLSearchParams({
      per_page: EXPLORE_VIDEOS_PER_PAGE,
      page: 1,
      ...buildLocationParams(location),
    });
    return await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-reels?${params}`,
      {
        key: `reels:${langCode || "en"}:${params.toString()}`,
        // Seed keeps this server-rendered page 1 in the same shuffle the client
        // pagination (ExploreVideos.jsx) continues with.
        headers: { "Content-Language": langCode || "en", ...(await seedHeader()) },
      }
    );
  } catch (error) {
    console.error("Error fetching explore videos:", error);
    return null;
  }
};

const ExploreVideosSection = async ({ langCode }) => {
  const location = await getLocationCookie();
  const json = await getReels(location, langCode);

  const videos = json?.data?.data || [];
  if (!videos.length) return null;

  return (
    <ExploreVideos
      // Same remount reasoning as AllItemsSection.
      key={JSON.stringify({ langCode, location })}
      initialVideosData={videos}
      initialHasMore={(json?.data?.current_page || 1) < (json?.data?.last_page || 1)}
      initialPage={json?.data?.current_page || 1}
      initialCityData={location}
      initialKmRange={Number(location?.kmRange) || 0}
    />
  );
};

export default ExploreVideosSection;
