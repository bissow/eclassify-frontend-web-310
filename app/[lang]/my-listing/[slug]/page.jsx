import AdDetails from "@/features/ad-details/AdDetails";
import {
  buildDetailBannerMap,
  getDetailBannerAds,
  getMyItemData,
  getReelForItem,
} from "@/lib/server/adDetail";

export const generateMetadata = async ({ params }) => {
  if (process.env.NEXT_PUBLIC_SEO === "false") return null;
  const { slug, lang: langCode } = await params;
  try {
    const item = await getMyItemData(slug, langCode)
    const title = item?.seo_detail?.translated_meta_title || item?.translation?.name;
    const description = item?.seo_detail?.translated_meta_description || item?.translation?.description;
    const keywords = item?.seo_detail?.translated_meta_keywords || process.env.NEXT_PUBLIC_META_kEYWORDS;
    const image = item?.image;

    return {
      title: title || process.env.NEXT_PUBLIC_META_TITLE,
      description: description || process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: image ? [image] : [],
      },
      keywords: keywords,
      // Owner-only view — never index it.
      robots: { index: false, follow: false },
    };
  } catch (error) {
    console.error("Error fetching MetaData:", error);
    return null;
  }
};

const MyListingPage = async ({ params }) => {
  const { slug, lang: langCode } = await params;

  // getMyItemData is cache()d, so this reuses generateMetadata's request.
  const [item, bannerAds] = await Promise.all([
    getMyItemData(slug, langCode),
    getDetailBannerAds(langCode),
  ]);

  const reelData =
    item?.item_type === "reel"
      ? await getReelForItem({ itemId: item.id, isMyListing: true, langCode })
      : null;

  return (
    <AdDetails
      item={item}
      isMyListing
      bannerMap={buildDetailBannerMap(bannerAds)}
      reelData={reelData}
    />
  );
};

export default MyListingPage;
