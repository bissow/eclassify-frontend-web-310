import { Suspense } from "react";
import { truncate } from "@/lib/utils";
import BreadCrumb from "@/components/common/BreadCrumb";
import AdUnit from "@/components/adsense/AdUnit";
import OpenInApp from "@/components/common/OpenInApp";
import BlogArticle from "@/features/blogs/detail/BlogArticle";
import RelatedArticles from "@/features/blogs/detail/RelatedArticles";
import PopularBlogCategories from "@/features/blogs/detail/PopularBlogCategories";
import PopularPostsSection from "@/features/blogs/shared/PopularPostsSection";
import TagsSection from "@/features/blogs/shared/TagsSection";
import {
  PopularPostsSkeleton,
  TagsSkeleton,
} from "@/features/blogs/shared/BlogsSkeletons";

// Server shell. Article + related articles + popular categories all come from
// the single page-level blogs?slug= fetch; only the two sidebar widgets that
// need their own endpoints stream behind Suspense.
const BlogDetailPage = ({ langCode, blog, relatedArticles = [], popularCategories = [] }) => {
  const category = blog?.category;

  return (
    <>
      <BreadCrumb
        items={
          blog
            ? [
              { nameKey: "ourBlogs", href: "/blogs" },
              // Skipped for an uncategorised blog rather than rendering a
              // crumb that links nowhere.
              ...(category?.slug
                ? [{
                  name: category.translated_name || category.name,
                  href: `/blogs/category/${category.slug}`,
                }]
                : []),
              { name: truncate(blog?.translated_title || blog?.title, 30) },
            ]
            : [{ nameKey: "ourBlogs" }]
        }
      />
      <div className="container">
        <div className="flex flex-col mt-8 gap-12">
          <div className="grid md:grid-cols-12 grid-col-1 gap-6">
            <BlogArticle blog={blog} />
            <div className="col-span-1 md:col-span-4 flex flex-col gap-8">
              <Suspense fallback={<PopularPostsSkeleton />}>
                <PopularPostsSection langCode={langCode} />
              </Suspense>
              <PopularBlogCategories categories={popularCategories} />
              <Suspense fallback={<TagsSkeleton />}>
                <TagsSection langCode={langCode} />
              </Suspense>
              <AdUnit type='square' className="mt-8 aspect-square" />
            </div>
          </div>
          <RelatedArticles blogs={relatedArticles} />
        </div>
      </div>
      <OpenInApp />
    </>
  );
};

export default BlogDetailPage;
