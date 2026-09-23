import { Suspense } from "react";
import BreadCrumb from "@/components/common/BreadCrumb";
import AdUnit from "@/components/adsense/AdUnit";
import BlogsHeading from "@/features/blogs/list/BlogsHeading";
import BlogsListSection from "@/features/blogs/list/BlogsListSection";
import BlogCategorySection from "@/features/blogs/list/BlogCategorySection";
import TagsSection from "@/features/blogs/shared/TagsSection";
import PopularPostsSection from "@/features/blogs/shared/PopularPostsSection";
import {
  BlogCategorySkeleton,
  BlogsListSkeleton,
  PopularPostsSkeleton,
  TagsSkeleton,
} from "@/features/blogs/shared/BlogsSkeletons";

// Server shell. Each section streams independently — a slow tags/popular-posts
// call can't hold back the blog list (and vice versa).
const Blogs = ({ langCode, tag, categorySlug, categoryName = "" }) => {
  const listKey = `${langCode}|${tag || ""}|${categorySlug || ""}`;

  return (
    <>
      <BreadCrumb
        items={
          categoryName
            ? [{ nameKey: "ourBlogs", href: "/blogs" }, { name: categoryName }]
            : [{ nameKey: "ourBlogs" }]
        }
      />
      <div className="container">
        <div className="flex flex-col mt-8 gap-6">
          <BlogsHeading categoryName={categoryName} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 ">
            <div className="lg:col-span-8 col-span-12 order-2 lg:order-1">
              <Suspense key={listKey} fallback={<BlogsListSkeleton />}>
                <BlogsListSection
                  langCode={langCode}
                  tag={tag}
                  categorySlug={categorySlug}
                />
              </Suspense>
            </div>
            <div className="col-span-12 lg:col-span-4 order-1 lg:order-2 flex flex-col gap-8">
              <Suspense fallback={<BlogCategorySkeleton />}>
                <BlogCategorySection langCode={langCode} tag={tag} />
              </Suspense>
              <Suspense fallback={<TagsSkeleton />}>
                <TagsSection langCode={langCode} tag={tag} categorySlug={categorySlug} />
              </Suspense>
              <Suspense fallback={<PopularPostsSkeleton />}>
                <PopularPostsSection langCode={langCode} />
              </Suspense>
              <AdUnit type="vertical" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blogs;
