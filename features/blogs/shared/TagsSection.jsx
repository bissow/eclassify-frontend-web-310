import { etagFetch } from "@/lib/server/etagFetch";
import Tags from "@/features/blogs/shared/Tags";

const getBlogTags = async (langCode) => {
  try {
    const json = await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}blog-tags`,
      {
        key: `blog-tags:${langCode || "en"}`,
        headers: { "Content-Language": langCode || "en" },
      }
    );
    return json?.data || [];
  } catch (error) {
    console.error("Error fetching blog tags:", error);
    return [];
  }
};

const TagsSection = async ({ langCode, tag, categorySlug }) => {
  const blogTags = await getBlogTags(langCode);

  return <Tags key={langCode} tag={tag} blogTags={blogTags} categorySlug={categorySlug} />;
};

export default TagsSection;
