import FaqsPage from "@/features/faq/FaqsPage";
import { buildSeoUrls, fetchSeoData, getLanguageCodes } from "@/lib/server/seo";
import { etagFetch } from "@/lib/server/etagFetch";
import StructuredData from "@/components/layout/StructuredData";

export const dynamic = "force-dynamic";

const getFaqs = async (langCode) => {
  try {
    const json = await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}faq`,
      {
        key: `faqs:${langCode || "en"}`,
        headers: { "Content-Language": langCode || "en" },
      }
    );
    return json?.data || [];
  } catch (error) {
    console.error("Error fetching faqs:", error);
    return [];
  }
};

export const generateMetadata = async ({ params }) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return null;
    const { lang: langCode } = await params;

    const [faqs, langData] = await Promise.all([
      fetchSeoData({
        page: "faqs",
        langCode,
      }),
      getLanguageCodes(),
    ]);

    const { supportedLangs, defaultLangCode } = langData;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: "faqs",
    });

    return {
      title: faqs?.translated_title || process.env.NEXT_PUBLIC_META_TITLE,
      description:
        faqs?.translated_description ||
        process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: faqs?.image ? [faqs?.image] : [],
      },
      keywords:
        faqs?.translated_keywords || process.env.NEXT_PUBLIC_META_kEYWORDS,
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

const page = async ({ params }) => {
  const { lang: langCode } = await params;
  const [seo, faqs] = await Promise.all([
    fetchSeoData({ page: "faqs", langCode }),
    getFaqs(langCode),
  ]);

  let schema = null;
  if (seo?.translated_schema) {
    try {
      schema = JSON.parse(seo.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for faqs schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <FaqsPage faqs={faqs} />
    </>
  );
};

export default page;
