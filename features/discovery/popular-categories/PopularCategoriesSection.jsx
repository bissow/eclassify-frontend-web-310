import { getLocationCookie } from "@/lib/server/locationCookie";
import { etagFetch } from "@/lib/server/etagFetch";
import PopularCategoriesCarousel from "@/features/discovery/popular-categories/PopularCategoriesCarousel";

const getPopularCategories = async (langCode) => {
  try {
    const json = await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-popular-categories`,
      {
        key: `popular-categories:${langCode || "en"}`,
        headers: { "Content-Language": langCode || "en" },
      }
    );
    return json?.data || [];
  } catch (error) {
    console.error("Error fetching popular categories:", error);
    return [];
  }
};

const PopularCategoriesSection = async ({ langCode }) => {
  const [cateData, location] = await Promise.all([
    getPopularCategories(langCode),
    getLocationCookie(),
  ]);

  if (!cateData.length) return null;

  return (
    <PopularCategoriesCarousel
      // Same remount reasoning as AllItemsSection.
      key={JSON.stringify({ langCode, location })}
      cateData={cateData}
      cityData={location}
      kmRange={Number(location?.kmRange) || 0}
    />
  );
};

export default PopularCategoriesSection;
