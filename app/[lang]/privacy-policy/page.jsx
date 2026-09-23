import PrivacyPolicy from "@/features/legal/PrivacyPolicy";
import { buildSeoUrls, fetchSeoData, getLanguageCodes } from "@/lib/server/seo";
import StructuredData from "@/components/layout/StructuredData";
import { getSystemSettings } from "@/lib/server/bootstrap";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params }) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return null;
    const { lang: langCode } = await params;

    const [privacyPolicy, langData] = await Promise.all([
      fetchSeoData({
        page: "privacy-policy",
        langCode,
      }),
      getLanguageCodes(),
    ]);

    const { supportedLangs, defaultLangCode } = langData;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: "privacy-policy",
    });

    return {
      title:
        privacyPolicy?.translated_title || process.env.NEXT_PUBLIC_META_TITLE,
      description:
        privacyPolicy?.translated_description ||
        process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: privacyPolicy?.image ? [privacyPolicy?.image] : [],
      },
      keywords:
        privacyPolicy?.translated_keywords ||
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

const PrivacyPolicyPage = async ({ params }) => {
  const { lang: langCode } = await params;
  const [privacyPolicy, settings] = await Promise.all([
    fetchSeoData({ page: "privacy-policy", langCode }),
    getSystemSettings(langCode), // deduped w/ layout.jsx via React cache() — no extra fetch
  ]);
  const content = settings?.data?.privacy_policy;

  let schema = null;
  if (privacyPolicy?.translated_schema) {
    try {
      schema = JSON.parse(privacyPolicy.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for privacy-policy schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <PrivacyPolicy content={content} />
    </>
  );
};
export default PrivacyPolicyPage;
