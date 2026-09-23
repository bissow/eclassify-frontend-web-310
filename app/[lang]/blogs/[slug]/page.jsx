import { cache } from "react";
import BlogDetailPage from "@/features/blogs/BlogDetailPage";
import { buildSeoUrls, getKeywords, getLanguageCodes } from "@/lib/server/seo";
import { etagFetch } from "@/lib/server/etagFetch";
import { authHeader } from "@/lib/server/locationCookie";
import StructuredData from "@/components/layout/StructuredData";


// cache() → generateMetadata and the page share one request (the view counter
// on the backend fires once per hit). Token from the cookie keeps user_feedback
// personalized; etagFetch skips its shared store when Authorization is set.
const getBlogData = cache(async (slug, langCode) => {
  try {
    const json = await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}blogs?slug=${slug}`,
      {
        key: `blog:${langCode || "en"}:${slug}`,
        headers: {
          "Content-Language": langCode || "en",
          ...(await authHeader()),
        },
      }
    );
    return {
      blog: json?.data?.data?.[0] || null,
      relatedArticles: json?.related_articles || [],
      popularCategories: json?.popular_categories || [],
    };
  } catch (error) {
    console.error("Error fetching blog detail:", error);
    return { blog: null, relatedArticles: [], popularCategories: [] };
  }
});

export const generateMetadata = async ({ params }) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return null;
    const { slug, lang: langCode } = await params;

    const [{ blog: data }, langData] = await Promise.all([
      getBlogData(slug, langCode),
      getLanguageCodes(),
    ]);

    const { supportedLangs, defaultLangCode } = langData;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: `blogs/${slug}`,
    });

    return {
      title: data?.seo_detail?.translated_meta_title || data?.translated_title || process.env.NEXT_PUBLIC_META_TITLE,
      description: data?.seo_detail?.translated_meta_description || process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: data?.image ? [data?.image] : [],
      },
      keywords: getKeywords(data?.seo_detail?.translated_meta_keywords, data?.translated_tags || process.env.NEXT_PUBLIC_META_kEYWORDS),
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

const BlogPage = async ({ params }) => {
  const { slug, lang: langCode } = await params;
  const { blog, relatedArticles, popularCategories } = await getBlogData(slug, langCode);
  let schema = null;
  if (blog?.seo_detail?.translated_schema) {
    try {
      schema = JSON.parse(blog.seo_detail.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for blog schema:", e);
    }
  }
  return (
    <>
      <StructuredData data={schema} />
      <BlogDetailPage
        langCode={langCode}
        blog={blog}
        relatedArticles={relatedArticles}
        popularCategories={popularCategories}
      />
    </>
  );
};

export default BlogPage;
