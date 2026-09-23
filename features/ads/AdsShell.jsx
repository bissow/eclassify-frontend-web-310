import { Suspense } from "react";
import BreadCrumb from "@/components/common/BreadCrumb";
import AdUnit from "@/components/adsense/AdUnit";
import SectionBanners from "@/components/custom-banners/SectionBanners";
import Filter from "@/features/filter/Filter";
import ActiveFilters from "@/features/filter/ActiveFilters";
import AdsCategoryCarousel from "@/features/ads/AdsCategoryCarousel";
import AdsToolbar from "@/features/ads/AdsToolbar";
import AdsListingSkeleton from "@/features/ads/AdsListingSkeleton";
import AdsListingSection from "@/features/ads/AdsListingSection";
import {
  buildItemListParams,
  buildListingBannerMap,
  getListingBannerAds,
  paramsKey,
} from "@/features/ads/lib/adsData";
import { getSystemSettings } from "@/lib/server/bootstrap";


const AdsShell = async ({
  langCode,
  searchParams,
  leafSlug = null,
  featuredSlug = null,
  customFields = [],
  categoryTrail = [],
  subcategories = [],
  subCurrentPage = 1,
  subLastPage = 1,
  title,
}) => {
  const [bannerAds, settings] = await Promise.all([
    getListingBannerAds(langCode),
    getSystemSettings(langCode),
  ]);
  const bannerMap = buildListingBannerMap(bannerAds);


  const listParams = buildItemListParams({
    searchParams,
    leafSlug,
    featuredSlug,
    settings,
    page: 1,
  });


  const breadcrumbItems = [
    { nameKey: "ads", href: categoryTrail.length || featuredSlug ? "/ads" : undefined },
    ...(featuredSlug
      ? [{ name: title || featuredSlug }]
      : categoryTrail.map((category, index) => ({
        name: category.translated_name || category.name,
        href: `/ads/${categoryTrail.slice(0, index + 1).map((c) => c.slug).join("/")}`,
      }))),
  ];

  return (
    <>
      <BreadCrumb items={breadcrumbItems} />
      <div className="container mt-8">
        <div className="flex flex-col">
          <SectionBanners banners={bannerMap["category_list_above"]} className="mb-6" />
          <AdUnit type="banner" className="mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="xl:col-span-3 lg:col-span-4 col-span-1">
              <Filter customFields={customFields} />
              <div className="hidden lg:block sticky top-4 mt-8">
                <SectionBanners banners={bannerMap["listing_data_side"]} />
              </div>
              <AdUnit type="square" className="mt-8 aspect-square" />
            </div>
            <div className="xl:col-span-9 lg:col-span-8 col-span-1 flex flex-col gap-6">
              {featuredSlug ? (
                <h1 className="text-2xl font-semibold break-all">{title || featuredSlug}</h1>
              ) : (
                <AdsCategoryCarousel
                  // Remount per category — useState(initialItems) would
                  // otherwise keep the previous category's subcategories when
                  // navigating between two category pages.
                  key={leafSlug || "root"}
                  leafSlug={leafSlug}
                  categoryTrail={categoryTrail}
                  initialItems={subcategories}
                  initialCurrentPage={subCurrentPage}
                  initialLastPage={subLastPage}
                />
              )}
              <SectionBanners banners={bannerMap["category_list_below"]} />
              <AdsToolbar />
              <ActiveFilters customFields={customFields} />
              <Suspense key={paramsKey(listParams)} fallback={<AdsListingSkeleton />}>
                <AdsListingSection langCode={langCode} listParams={listParams} />
              </Suspense>
            </div>
          </div>
          <SectionBanners banners={bannerMap["listing_data_below"]} className="mt-6 sm:mt-12" />
          <AdUnit type="banner" />
        </div>
      </div>
    </>
  );
};

export default AdsShell;
