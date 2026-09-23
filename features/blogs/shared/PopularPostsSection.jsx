import { etagFetch } from "@/lib/server/etagFetch";
import PopularPosts from "@/features/blogs/shared/PopularPosts";

const getPopularBlogs = async (langCode) => {
  try {
    const json = await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-popular-blogs?per_page=4`,
      {
        key: `popular-blogs:${langCode || "en"}`,
        headers: { "Content-Language": langCode || "en" },
      }
    );
    return json?.data?.data || [];
  } catch (error) {
    console.error("Error fetching popular blogs:", error);
    return [];
  }
};

const PopularPostsSection = async ({ langCode }) => {
  const popularPosts = await getPopularBlogs(langCode);

  return <PopularPosts popularPosts={popularPosts} />;
};

export default PopularPostsSection;
