import { etagFetch } from "@/lib/server/etagFetch";
import BlogCategory from "@/features/blogs/list/BlogCategory";

const getBlogCategories = async (langCode) => {
  try {
    return await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-blog-categories?page=1`,
      {
        key: `blog-categories:${langCode || "en"}`,
        headers: { "Content-Language": langCode || "en" },
      }
    );
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return null;
  }
};

const BlogCategorySection = async ({ langCode, tag }) => {
  const json = await getBlogCategories(langCode);
  const currentPage = json?.data?.current_page || 1;

  return (
    <BlogCategory
      key={langCode}
      initialCategories={json?.data?.data || []}
      initialCurrentPage={currentPage}
      initialHasMore={currentPage < (json?.data?.last_page || 1)}
      tag={tag}
    />
  );
};

export default BlogCategorySection;
