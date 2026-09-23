import { Suspense } from "react";
import StructuredData from "@/components/layout/StructuredData";
import AdDetails from "@/features/ad-details/AdDetails";
import { getCategoryTrail } from "@/features/ads/lib/adsData";
import SimilarAdsSection from "@/features/ad-details/SimilarAdsSection";
import { buildSeoUrls, getLanguageCodes } from "@/lib/server/seo";
import {
  buildDetailBannerMap,
  getDetailBannerAds,
  getItemData,
  getReelForItem,
} from "@/lib/server/adDetail";

export const generateMetadata = async ({ params }) => {
  if (process.env.NEXT_PUBLIC_SEO === "false") return null;
  const { slug, lang: langCode } = await params;
  try {
    const [item, { supportedLangs, defaultLangCode }] = await Promise.all([
      getItemData(slug, langCode),
      getLanguageCodes(),
    ]);

    const title = item?.seo_details?.translated_meta_title || process.env.NEXT_PUBLIC_META_TITLE;
    const description = item?.seo_details?.translated_meta_description || process.env.NEXT_PUBLIC_META_DESCRIPTION;
    const keywords = item?.seo_details?.translated_meta_keywords || process.env.NEXT_PUBLIC_META_KEYWORDS;
    const image = item?.image;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: `ad-details/${slug}`,
    });

    return {
      title: title || process.env.NEXT_PUBLIC_META_TITLE,
      description: description || process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: image ? [image] : [],
      },
      keywords: keywords,
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

const ProductDetailPage = async ({ params }) => {
  const { slug, lang: langCode } = await params;

  // getItemData is cache()d, so this is the same request generateMetadata used.
  const [item, bannerAds] = await Promise.all([
    getItemData(slug, langCode),
    getDetailBannerAds(langCode),
  ]);

  // Both need a field off the item, so they can't join the Promise.all above.
  // The item carries only its leaf category, so the ancestors come separately.
  const [reelData, categoryTrail] = await Promise.all([
    item?.item_type === "reel"
      ? getReelForItem({ itemId: item.id, isMyListing: false, langCode })
      : null,
    item?.category?.slug ? getCategoryTrail(item.category.slug, langCode) : [],
  ]);

  let schema = null;
  if (item?.seo_details?.translated_schema) {
    try {
      schema = JSON.parse(item.seo_details.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for ad schema:", e);
    }
  }

  const bannerMap = buildDetailBannerMap(bannerAds);

  return (
    <>
      <StructuredData data={schema} />
      <AdDetails
        item={item}
        categoryTrail={categoryTrail}
        bannerMap={bannerMap}
        reelData={reelData}
        similarAds={
          <Suspense key="similar-ads" fallback={null}>
            <SimilarAdsSection
              categoryId={item?.category?.id}
              itemId={item?.id}
              langCode={langCode}
              aboveBanners={bannerMap["ad_info_below"]}
              belowBanners={bannerMap["similar_ads_below"]}
            />
          </Suspense>
        }
      />
    </>
  );
};

export default ProductDetailPage;
