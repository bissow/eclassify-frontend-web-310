import AboutUs from "@/features/legal/AboutUs";
import { buildSeoUrls, fetchSeoData, getLanguageCodes } from "@/lib/server/seo";
import StructuredData from "@/components/layout/StructuredData";
import { getSystemSettings } from "@/lib/server/bootstrap";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params }) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return null;

    const { lang: langCode } = await params;

    const [aboutUs, langData] = await Promise.all([
      fetchSeoData({
        page: "about-us",
        langCode,
      }),
      getLanguageCodes(),
    ]);

    const { supportedLangs, defaultLangCode } = langData;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: "about-us",
    });

    return {
      title:
        aboutUs?.translated_title ||
        process.env.NEXT_PUBLIC_META_TITLE,
      description:
        aboutUs?.translated_description ||
        process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: aboutUs?.image ? [aboutUs?.image] : [],
      },
      keywords:
        aboutUs?.translated_keywords ||
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

const AboutUsPage = async ({ params }) => {
  const { lang: langCode } = await params;
  const [aboutUs, settings] = await Promise.all([
    fetchSeoData({ page: "about-us", langCode }),
    getSystemSettings(langCode), // deduped w/ layout.jsx via React cache() — no extra fetch
  ]);
  const content = settings?.data?.about_us;

  let schema = null;
  if (aboutUs?.translated_schema) {
    try {
      schema = JSON.parse(aboutUs.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for about-us schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <AboutUs content={content} />
    </>
  );
};

export default AboutUsPage;
