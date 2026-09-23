import { Suspense } from "react";
import StructuredData from "@/components/layout/StructuredData";
import AllItemsSection, { AllItemsSkeleton } from "@/features/discovery/all-items/AllItemsSection";
import FeaturedSectionsSection from "@/features/discovery/featured/FeaturedSectionsSection";
import FeaturedSectionsSkeleton from "@/features/discovery/featured/FeaturedSectionsSkeleton";
import ExploreVideosSection from "@/features/discovery/explore-videos/ExploreVideosSection";
import { ExploreVideosSkeleton } from "@/features/discovery/explore-videos/ExploreVideos";
import AdUnit from "@/components/adsense/AdUnit";
import SectionBanners from "@/components/custom-banners/SectionBanners";
import { buildSeoUrls, fetchSeoData, getLanguageCodes } from "@/lib/server/seo";
import { getSystemSettings } from "@/lib/server/bootstrap";
import { etagFetch } from "@/lib/server/etagFetch";
import PopularCategoriesSection from "@/features/discovery/popular-categories/PopularCategoriesSection";
import PopularCategoriesSkeleton from "@/features/discovery/popular-categories/PopularCategoriesSkeleton";
import OfferSliderSkeleton from "@/features/discovery/offers/OfferSliderSkeleton";
import SliderSection from "@/features/discovery/offers/SliderSection";

const getBannerAds = async (langCode) => {
  try {
    const params = new URLSearchParams({ platform: "web", page: "home" });
    const json = await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-banner-ads?${params}`,
      {
        key: `banner-ads:home:${langCode || "en"}`,
        headers: { "Content-Language": langCode || "en" },
      }
    );
    return json?.data || [];
  } catch (error) {
    console.error("Error fetching banner ads:", error);
    return [];
  }
};


const buildBannerMap = (sections, bannerAds) => {
  if (!sections?.length || !bannerAds?.length) return {};
  const sectionById = {};
  for (const section of sections) {
    sectionById[section.id] = section.section_type;
  }
  const grouped = {};
  for (const item of bannerAds) {
    const banner = Array.isArray(item) ? item[0] : item;
    if (!banner?.status) continue;
    let key;
    if (banner.feature_section_id) {
      key = "feature_" + banner.feature_section_id + "_" + banner.placement;
    } else {
      const sectionType = sectionById[banner.home_screen_section_id];
      if (!sectionType) continue;
      key = sectionType + "_" + banner.placement;
    }
    (grouped[key] ||= []).push(item);
  }
  return grouped;
};

export const generateMetadata = async ({ params }) => {
  if (process.env.NEXT_PUBLIC_SEO === "false") return null;

  const { lang: langCode } = await params;

  try {
    const [home, langData] = await Promise.all([
      fetchSeoData({
        page: "home",
        langCode,
      }),
      getLanguageCodes(),
    ]);
    const { supportedLangs, defaultLangCode } = langData;
    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
    });

    return {
      title:
        home?.translated_title ||
        process.env.NEXT_PUBLIC_META_TITLE,
      description:
        home?.translated_description ||
        process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: home?.image ? [home?.image] : [],
      },
      keywords:
        home?.translated_keywords ||
        process.env.NEXT_PUBLIC_META_kEYWORDS,
      alternates: {
        canonical: seoUrls.canonical,
        languages: seoUrls.languages,
      },
    };
  } catch (error) {
    console.error("Error fetching MetaData:", error);
    return null;
  }
};

export default async function HomePage({ params }) {
  const { lang: langCode } = await params;

  const [home, settings, bannerAds] = await Promise.all([
    fetchSeoData({ page: "home", langCode }),
    getSystemSettings(langCode), // deduped w/ layout.jsx via React cache() — no extra fetch
    getBannerAds(langCode),
  ]);

  // Home→landing first-visit redirect now lives in app/[lang]/layout.jsx, where
  // it fires before the layout <Suspense> streams (true 307, no flash).

  let schema = null;
  if (home?.translated_schema) {
    try {
      schema = JSON.parse(home.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for home schema:", e);
    }
  }

  const sections = settings?.data?.home_screen_sections ?? null;
  // null sections = API failed, fall back to showing everything
  const hasSection = (type) => !sections || sections.some((s) => s.section_type === type);
  const bannerMap = buildBannerMap(sections, bannerAds);

  return (
    <>
      <StructuredData data={schema} />
      <div className="flow-root">
        {hasSection("slider") && (
          <Suspense fallback={<OfferSliderSkeleton />}>
            <SliderSection
              langCode={langCode}
              aboveBanners={bannerMap["slider_above"]}
              belowBanners={bannerMap["slider_below"]}
            />
          </Suspense>
        )}
        {hasSection("popular_categories") && (
          <>
            <SectionBanners banners={bannerMap["popular_categories_above"]} className="container mb-6 sm:mb-12" />
            <Suspense fallback={<PopularCategoriesSkeleton />}>
              <PopularCategoriesSection langCode={langCode} />
            </Suspense>
            <SectionBanners banners={bannerMap["popular_categories_below"]} className="container mt-6 sm:mt-12" />
          </>
        )}
        <Suspense fallback={<ExploreVideosSkeleton />}>
          <ExploreVideosSection langCode={langCode} />
        </Suspense>
        <div className="container">
          <AdUnit type="banner" className="mt-12" />
        </div>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6">
            <div className="lg:col-span-12">
              {hasSection("featured_section") && (
                <>
                  <SectionBanners banners={bannerMap["featured_section_above"]} className="mb-6 sm:mb-12" />
                  <Suspense fallback={<FeaturedSectionsSkeleton />}>
                    <FeaturedSectionsSection langCode={langCode} bannerMap={bannerMap} />
                  </Suspense>
                  <SectionBanners banners={bannerMap["featured_section_below"]} className="mt-6 sm:mt-12" />
                </>
              )}
              {hasSection("all_ads") && (
                <Suspense fallback={<AllItemsSkeleton />}>
                  <AllItemsSection
                    langCode={langCode}
                    aboveBanners={bannerMap["all_ads_above"]}
                    belowBanners={bannerMap["all_ads_below"]}
                  />
                </Suspense>
              )}
            </div>
          </div>
          <AdUnit type="banner" className="mt-12" />
        </div>
      </div>
    </>
  );
}
