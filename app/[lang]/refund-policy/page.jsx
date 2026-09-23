import RefundPolicy from "@/features/legal/RefundPolicy";
import { buildSeoUrls, fetchSeoData, getLanguageCodes } from "@/lib/server/seo";
import StructuredData from "@/components/layout/StructuredData";
import { getSystemSettings } from "@/lib/server/bootstrap";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params }) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return null;
    const { lang: langCode } = await params;

    const [refundPolicy, langData] = await Promise.all([
      fetchSeoData({
        page: "refund-policy",
        langCode,
      }),
      getLanguageCodes(),
    ]);

    const { supportedLangs, defaultLangCode } = langData;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: "refund-policy",
    });

    return {
      title:
        refundPolicy?.translated_title || process.env.NEXT_PUBLIC_META_TITLE,
      description:
        refundPolicy?.translated_description ||
        process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: refundPolicy?.image ? [refundPolicy?.image] : [],
      },
      keywords:
        refundPolicy?.translated_keywords ||
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

const RefundPolicyPage = async ({ params }) => {
  const { lang: langCode } = await params;
  const [refundPolicy, settings] = await Promise.all([
    fetchSeoData({ page: "refund-policy", langCode }),
    getSystemSettings(langCode), // deduped w/ layout.jsx via React cache() — no extra fetch
  ]);
  const content = settings?.data?.refund_policy;

  let schema = null;
  if (refundPolicy?.translated_schema) {
    try {
      schema = JSON.parse(refundPolicy.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for refund-policy schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <RefundPolicy content={content} />
    </>
  );
};
export default RefundPolicyPage;
