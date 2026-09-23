import StructuredData from "@/components/layout/StructuredData";
import Blogs from "@/features/blogs/Blogs";
import { SEO_REVALIDATE_SECONDS } from "@/lib/constants";
import { buildSeoUrls, getKeywords, getLanguageCodes } from "@/lib/server/seo";

export const dynamic = "force-dynamic";

const getBlogCategoryData = async (slug, langCode) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-blog-categories?slug=${slug}`,
      {
        headers: { "Content-Language": langCode || "en" },
        next: { revalidate: SEO_REVALIDATE_SECONDS, tags: ["blogs"] },
      }
    );
    const data = await res.json();
    return data?.data?.data?.[0] || null;
  } catch (error) {
    console.error("Error fetching blog category data:", error);
    return null;
  }
};

export const generateMetadata = async ({ params }) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return null;

    const { lang: langCode, blogCategorySlug } = await params;

    const [category, langData] = await Promise.all([
      getBlogCategoryData(blogCategorySlug, langCode),
      getLanguageCodes(),
    ]);

    const { supportedLangs, defaultLangCode } = langData;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: `blogs/category/${blogCategorySlug}`,
    });

    return {
      title: category?.seo_detail?.translated_meta_title || category?.translated_name || process.env.NEXT_PUBLIC_META_TITLE,
      description: category?.seo_detail?.translated_meta_description || process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: category?.image ? [category.image] : [],
      },
      keywords: getKeywords(category?.seo_detail?.translated_meta_keywords, process.env.NEXT_PUBLIC_META_kEYWORDS),
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

const BlogCategoryPage = async ({ params, searchParams }) => {
  const [{ lang: langCode, blogCategorySlug }, { tag } = {}] = await Promise.all([
    params,
    searchParams,
  ]);
  const category = await getBlogCategoryData(blogCategorySlug, langCode);

  let schema = null;
  if (category?.seo_detail?.translated_schema) {
    try {
      schema = JSON.parse(category.seo_detail.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for blog category schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <Blogs
        langCode={langCode}
        tag={tag}
        categorySlug={blogCategorySlug}
        categoryName={category?.translated_name || category?.name || ""}
      />
    </>
  );
};

export default BlogCategoryPage;
