import { authHeader, buildLocationParams, getLocationCookie } from "@/lib/server/locationCookie";
import { etagFetch } from "@/lib/server/etagFetch";
import FeaturedSections from "@/features/discovery/featured/FeaturedSections";

const getFeaturedSections = async (location, langCode) => {
  try {
    const params = new URLSearchParams(buildLocationParams(location));
    const json = await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-featured-section?${params}`,
      {
        key: `featured:${langCode || "en"}:${params.toString()}`,
        headers: { "Content-Language": langCode || "en", ...(await authHeader()) },
      }
    );
    return json?.data || [];
  } catch (error) {
    console.error("Error fetching featured sections:", error);
    return [];
  }
};

const FeaturedSectionsSection = async ({ langCode, bannerMap }) => {
  const location = await getLocationCookie();
  const featuredData = await getFeaturedSections(location, langCode);

  const allEmpty =
    !featuredData?.length ||
    featuredData.every((ele) => ele?.section_data?.length === 0);
  if (allEmpty) return null;

  return (
    <FeaturedSections
      // Same remount reasoning as AllItemsSection.
      key={JSON.stringify({ langCode, location })}
      initialFeaturedData={featuredData}
      bannerMap={bannerMap}
      cityData={location}
      kmRange={Number(location?.kmRange) || 0}
    />
  );
};

export default FeaturedSectionsSection;
