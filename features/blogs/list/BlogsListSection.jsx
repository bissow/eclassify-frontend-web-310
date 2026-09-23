import { etagFetch } from "@/lib/server/etagFetch";
import BlogsList from "@/features/blogs/list/BlogsList";

const getBlogs = async ({ langCode, tag, categorySlug }) => {
  try {
    const params = new URLSearchParams({
      page: "1",
      ...(tag && { tag }),
      ...(categorySlug && { category_slug: categorySlug }),
    });
    return await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}blogs?${params}`,
      {
        key: `blogs:${langCode || "en"}:${params.toString()}`,
        headers: { "Content-Language": langCode || "en" },
      }
    );
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return null;
  }
};

const BlogsListSection = async ({ langCode, tag, categorySlug }) => {
  const json = await getBlogs({ langCode, tag, categorySlug });
  const currentPage = json?.data?.current_page || 1;

  return (
    <BlogsList
      // Remount on tag/category/lang change — otherwise React keeps the old
      // instance and useState(initial*) never re-seeds from the new props.
      key={`${langCode}|${tag || ""}|${categorySlug || ""}`}
      tag={tag}
      categorySlug={categorySlug}
      initialBlogs={json?.data?.data || []}
      initialCurrentPage={currentPage}
      initialHasMore={currentPage < (json?.data?.last_page || 1)}
    />
  );
};

export default BlogsListSection;
