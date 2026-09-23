import AdsShell from "@/features/ads/AdsShell";
import { getFeaturedSection } from "@/features/ads/lib/adsData";
import { buildSeoUrls, getLanguageCodes } from "@/lib/server/seo";
import StructuredData from "@/components/layout/StructuredData";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params }) => {
  if (process.env.NEXT_PUBLIC_SEO === "false") return null;

  const { lang: langCode, slug } = await params;

  try {
    const section = await getFeaturedSection(slug, langCode);

    const title =
      section?.translated_name || section?.title || process.env.NEXT_PUBLIC_META_TITLE;
    const description =
      section?.translated_description || process.env.NEXT_PUBLIC_META_DESCRIPTION;
    const image = section?.image || "";

    const { supportedLangs, defaultLangCode } = await getLanguageCodes();
    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: `ads/featured/${slug}`,
    });

    return {
      title,
      description,
      openGraph: {
        images: image ? [image] : [],
      },
      alternates: {
        canonical: seoUrls.canonical,
        languages: seoUrls.languages,
      },
    };
  } catch (error) {
    console.error("Error fetching featured section metadata:", error);
    return null;
  }
};

const FeaturedSectionPage = async ({ params, searchParams }) => {
  const { slug, lang: langCode } = await params;

  // cache()d, so generateMetadata's request is reused rather than repeated.
  const [section, query] = await Promise.all([
    getFeaturedSection(slug, langCode),
    searchParams,
  ]);

  return (
    <>
      <StructuredData data={null} />
      <AdsShell
        langCode={langCode}
        searchParams={new URLSearchParams(query)}
        featuredSlug={slug}
        title={section?.translated_name || section?.title || slug}
      />
    </>
  );
};

export default FeaturedSectionPage;
