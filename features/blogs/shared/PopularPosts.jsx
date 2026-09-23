"use client";
import NoData from "@/components/empty-states/NoData";
import { useTranslation } from "@/lang/useTranslation";
import CustomLink from "@/components/common/CustomLink";
import CustomImage from "@/components/common/CustomImage";

// Data is server-fetched (sections/PopularPostsSection) — this is render-only.
const PopularPosts = ({ popularPosts = [] }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col border rounded-xl">
      <div className="p-4 border-b">
        <p className="font-bold">{t("popularPosts")}</p>
      </div>
      <div className="flex flex-col gap-2">
        {popularPosts.length > 0 ? (
          popularPosts.map((popularBlog) => (
            <CustomLink
              key={popularBlog?.id}
              href={`/blogs/${popularBlog?.slug}`}
              className="flex gap-3 px-4 py-2 items-center"
            >
              <CustomImage
                src={popularBlog?.image}
                alt={popularBlog?.title}
                height={48}
                width={64}
                className="aspect-64/48 rounded object-cover"
              />
              <p className="line-clamp-3 font-medium">
                {popularBlog?.translated_title || popularBlog?.title}
              </p>
            </CustomLink>
          ))
        ) : (
          <div className="col-span-full">
            <NoData title={t("noPopularPostsFound")} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularPosts;
