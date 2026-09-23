import { getLocationCookie } from "@/lib/server/locationCookie";
import { etagFetch } from "@/lib/server/etagFetch";
import OfferSlider from "@/features/discovery/offers/OfferSlider";

// Slider only ever filters by city/state/country hierarchy — no
// radius/lat-long branch, unlike buildLocationParams (AllItems/Featured/
// ExploreVideos) — matches the original client fetch exactly.
const buildSliderParams = (location) => {
  if (!location) return {};
  if (location.city) {
    return { city: location.city, state: location.state, country: location.country };
  }
  if (location.state) return { state: location.state };
  if (location.country) return { country: location.country };
  return {};
};

const getSlider = async (location, langCode) => {
  try {
    const params = new URLSearchParams(buildSliderParams(location));
    const json = await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-slider?${params}`,
      {
        key: `slider:${langCode || "en"}:${params.toString()}`,
        headers: { "Content-Language": langCode || "en" },
      }
    );
    return json?.data || [];
  } catch (error) {
    console.error("Error fetching slider:", error);
    return [];
  }
};

const SliderSection = async ({ langCode, aboveBanners, belowBanners }) => {
  const location = await getLocationCookie();
  const slides = await getSlider(location, langCode);

  if (!slides.length) return null;

  return (
    <OfferSlider
      Slider={slides}
      aboveBanners={aboveBanners}
      belowBanners={belowBanners}
    />
  );
};

export default SliderSection;
