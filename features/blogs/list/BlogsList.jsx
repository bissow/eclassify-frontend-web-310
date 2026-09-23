"use client";
import { useState } from "react";
import { useTranslation } from "@/lang/useTranslation";
import { getBlogsApi } from "@/lib/api";
import BlogCard from "@/components/common/BlogCard";
import { Button } from "@/components/ui/button";
import NoData from "@/components/empty-states/NoData";

// Page 1 is server-rendered and arrives as props; this component only owns
// "load more". Parent remounts it (key) when tag/category/lang change, so the
// useState initial values always re-seed from fresh server data.
const BlogsList = ({
  tag,
  categorySlug,
  initialBlogs = [],
  initialCurrentPage = 1,
  initialHasMore = false,
}) => {
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState(initialBlogs);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadMore, setIsLoadMore] = useState(false);

  const handleLoadMore = async () => {
    try {
      setIsLoadMore(true);
      const res = await getBlogsApi.getBlogs({
        page: currentPage + 1,
        ...(tag && { tag }),
        ...(categorySlug && { category_slug: categorySlug }),
      });
      if (res?.data?.error === false) {
        setBlogs((prev) => [...prev, ...(res?.data?.data?.data ?? [])]);
        setCurrentPage(res?.data?.data?.current_page);
        setHasMore(res?.data?.data?.current_page < res?.data?.data?.last_page);
      } else {
        console.error(res?.data?.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadMore(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blogs?.length > 0 ? (
          blogs.map((blog) => <BlogCard key={blog?.id} blog={blog} />)
        ) : (
          <div className="col-span-full">
            <NoData title={t("noBlogFound")} />
          </div>
        )}
      </div>
      {hasMore && (
        <div className="text-center mt-6 mb-2">
          <Button
            variant="outline"
            className="text-sm sm:text-base text-primary w-[256px]"
            disabled={isLoadMore}
            onClick={handleLoadMore}
          >
            {isLoadMore ? t("loading") : t("loadMore")}
          </Button>
        </div>
      )}
    </>
  );
};

export default BlogsList;
