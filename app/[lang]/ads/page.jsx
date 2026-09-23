import AdsShell from "@/features/ads/AdsShell";
import { buildSeoUrls, fetchSeoData, getLanguageCodes } from "@/lib/server/seo";
import StructuredData from "@/components/layout/StructuredData";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params }) => {
  if (process.env.NEXT_PUBLIC_SEO === "false") return null;

  const { lang: langCode } = await params;

  try {
    const adListing = await fetchSeoData({ page: "ad-listing", langCode });

    const title =
      adListing?.translated_title || process.env.NEXT_PUBLIC_META_TITLE;
    const description =
      adListing?.translated_description || process.env.NEXT_PUBLIC_META_DESCRIPTION;
    const keywords =
      adListing?.translated_keywords || process.env.NEXT_PUBLIC_META_kEYWORDS;
    const image = adListing?.image || "";

    const { supportedLangs, defaultLangCode } = await getLanguageCodes();
    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: "ads",
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
    console.error("Error fetching MetaData:", error);
    return null;
  }
};

const AdsPage = async ({ params, searchParams }) => {
  const { lang: langCode } = await params;
  const [seoData, query] = await Promise.all([
    fetchSeoData({ page: "ad-listing", langCode }),
    searchParams,
  ]);

  let schema = null;
  if (seoData?.translated_schema) {
    try {
      schema = JSON.parse(seoData.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for ads schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <AdsShell
        langCode={langCode}
        searchParams={new URLSearchParams(query)}
      />
    </>
  );
};

export default AdsPage;
