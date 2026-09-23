import CategorySelectionSubscription from "@/features/subscription/CategorySelectionSubscription";
import { buildSeoUrls, fetchSeoData, getLanguageCodes } from "@/lib/server/seo";
import StructuredData from "@/components/layout/StructuredData";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params }) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return null;
    const { lang: langCode } = await params;

    const [subscription, langData] = await Promise.all([
      fetchSeoData({
        page: "subscription",
        langCode,
      }),
      getLanguageCodes(),
    ]);

    const { supportedLangs, defaultLangCode } = langData;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: "subscription",
    });

    return {
      title: subscription?.translated_title || process.env.NEXT_PUBLIC_META_TITLE,
      description:
        subscription?.translated_description ||
        process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: subscription?.image ? [subscription?.image] : [],
      },
      keywords:
        subscription?.translated_keywords || process.env.NEXT_PUBLIC_META_kEYWORDS,
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

const SubscriptionPage = async ({ params }) => {
  const { lang: langCode } = await params;
  const subscription = await fetchSeoData({ page: "subscription", langCode });

  let schema = null;
  if (subscription?.translated_schema) {
    try {
      schema = JSON.parse(subscription.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for subscription schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <CategorySelectionSubscription />
    </>
  );
};

export default SubscriptionPage;