import { Suspense } from "react";
import AnythingYouWant from "@/features/marketing/AnythingYouWant";
import OurBlogs, { OurBlogsSkeleton } from "@/features/marketing/OurBlogs";
import QuickAnswers, { QuickAnswersSkeleton } from "@/features/marketing/QuickAnswers";
import WorkProcess from "@/features/marketing/WorkProcess";
import { buildSeoUrls, fetchSeoData, getLanguageCodes } from "@/lib/server/seo";
import StructuredData from "@/components/layout/StructuredData";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params }) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return null;
    const { lang: langCode } = await params;

    const [landing, langData] = await Promise.all([
      fetchSeoData({
        page: "landing",
        langCode,
      }),
      getLanguageCodes(),
    ]);

    const { supportedLangs, defaultLangCode } = langData;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: "landing",
    });

    return {
      title: landing?.translated_title || process.env.NEXT_PUBLIC_META_TITLE,
      description:
        landing?.translated_description ||
        process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: landing?.image ? [landing?.image] : [],
      },
      keywords:
        landing?.translated_keywords || process.env.NEXT_PUBLIC_META_kEYWORDS,
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

const LandingPage = async ({ params }) => {
  const { lang: langCode } = await params;
  const landing = await fetchSeoData({ page: "landing", langCode });

  let schema = null;
  if (landing?.translated_schema) {
    try {
      schema = JSON.parse(landing.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for landing schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <AnythingYouWant />
      <WorkProcess />
      <Suspense fallback={<OurBlogsSkeleton />}>
        <OurBlogs langCode={langCode} />
      </Suspense>
      <Suspense fallback={<QuickAnswersSkeleton />}>
        <QuickAnswers langCode={langCode} />
      </Suspense>
    </>
  );
};

export default LandingPage;
