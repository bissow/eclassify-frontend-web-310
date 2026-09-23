import TermsAndCondition from "@/features/legal/TermsAndCondition";
import { buildSeoUrls, fetchSeoData, getLanguageCodes } from "@/lib/server/seo";
import StructuredData from "@/components/layout/StructuredData";
import { getSystemSettings } from "@/lib/server/bootstrap";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params }) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return null;
    const { lang: langCode } = await params;

    const [termsAndConditions, langData] = await Promise.all([
      fetchSeoData({
        page: "terms-and-conditions",
        langCode,
      }),
      getLanguageCodes(),
    ]);

    const { supportedLangs, defaultLangCode } = langData;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: "terms-and-condition",
    });

    return {
      title:
        termsAndConditions?.translated_title ||
        process.env.NEXT_PUBLIC_META_TITLE,
      description:
        termsAndConditions?.translated_description ||
        process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: termsAndConditions?.image ? [termsAndConditions?.image] : [],
      },
      keywords:
        termsAndConditions?.translated_keywords ||
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

const TermsAndConditionPage = async ({ params }) => {
  const { lang: langCode } = await params;
  const [termsAndConditions, settings] = await Promise.all([
    fetchSeoData({ page: "terms-and-conditions", langCode }),
    getSystemSettings(langCode), // deduped w/ layout.jsx via React cache() — no extra fetch
  ]);
  const content = settings?.data?.terms_conditions;

  let schema = null;
  if (termsAndConditions?.translated_schema) {
    try {
      schema = JSON.parse(termsAndConditions.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for terms-and-conditions schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <TermsAndCondition content={content} />
    </>
  );
};
export default TermsAndConditionPage;
