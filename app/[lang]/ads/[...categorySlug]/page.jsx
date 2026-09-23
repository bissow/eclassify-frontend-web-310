import AdsShell from "@/features/ads/AdsShell";
import {
  getCategoryBundle,
  getCategoryCustomFields,
  getCategoryTrail,
} from "@/features/ads/lib/adsData";
import { buildSeoUrls, getKeywords, getLanguageCodes } from "@/lib/server/seo";
import StructuredData from "@/components/layout/StructuredData";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params }) => {
  if (process.env.NEXT_PUBLIC_SEO === "false") return null;

  const { lang: langCode, categorySlug } = await params;
  const leafSlug = categorySlug[categorySlug.length - 1];

  try {
    const { seoDetail: seo_detail } = await getCategoryBundle(leafSlug, langCode);

    const title =
      seo_detail?.translated_meta_title || process.env.NEXT_PUBLIC_META_TITLE;
    const description =
      seo_detail?.translated_meta_description ||
      process.env.NEXT_PUBLIC_META_DESCRIPTION;
    const keywords = getKeywords(
      seo_detail?.translated_meta_keywords,
      process.env.NEXT_PUBLIC_META_kEYWORDS
    );
    const image = seo_detail?.image || "";

    const { supportedLangs, defaultLangCode } = await getLanguageCodes();

    const slugPath = categorySlug.join("/");
    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: `ads/${slugPath}`,
    });

    return {
      title,
      description,
      openGraph: {
        images: image ? [image] : [],
      },
      keywords,
      alternates: {
        canonical: seoUrls.canonical,
        languages: seoUrls.languages,
      },
    };
  } catch (error) {
    console.error("Error fetching category metadata:", error);
    return null;
  }
};

const CategoryAdsPage = async ({ params, searchParams }) => {
  const { lang: langCode, categorySlug } = await params;
  const leafSlug = categorySlug[categorySlug.length - 1];


  const [bundle, categoryTrail, query] = await Promise.all([
    getCategoryBundle(leafSlug, langCode),
    getCategoryTrail(leafSlug, langCode),
    searchParams,
  ]);
  const customFields = await getCategoryCustomFields(
    bundle.selfCategory?.id,
    langCode
  );

  let schema = null;
  if (bundle.seoDetail?.translated_schema) {
    try {
      schema = JSON.parse(bundle.seoDetail.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for category schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <AdsShell
        langCode={langCode}
        searchParams={new URLSearchParams(query)}
        leafSlug={leafSlug}
        categoryTrail={categoryTrail}
        customFields={customFields}
        subcategories={bundle.subcategories}
        subCurrentPage={bundle.subCurrentPage}
        subLastPage={bundle.subLastPage}
      />
    </>
  );
};

export default CategoryAdsPage;
