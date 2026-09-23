import StructuredData from "@/components/layout/StructuredData";
import Blogs from "@/features/blogs/Blogs";
import { buildSeoUrls, fetchSeoData, getLanguageCodes } from "@/lib/server/seo";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params }) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return null;

    const { lang: langCode } = await params;

    const [blogs, langData] = await Promise.all([
      fetchSeoData({
        page: "blogs",
        langCode,
      }),

      getLanguageCodes(),
    ]);

    const { supportedLangs, defaultLangCode } = langData;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: "blogs",
    });

    return {
      title:
        blogs?.translated_title ||
        process.env.NEXT_PUBLIC_META_TITLE,
      description:
        blogs?.translated_description ||
        process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: blogs?.image ? [blogs?.image] : [],
      },
      keywords:
        blogs?.translated_keywords ||
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


const BlogsPage = async ({ params, searchParams }) => {
  const [{ lang: langCode }, { tag } = {}] = await Promise.all([params, searchParams]);
  const blogs = await fetchSeoData({ page: "blogs", langCode });
  let schema = null;
  if (blogs?.translated_schema) {
    try {
      schema = JSON.parse(blogs.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for blogs schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <Blogs langCode={langCode} tag={tag} />
    </>
  );
};

export default BlogsPage;
