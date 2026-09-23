"use client";
import { useTranslation } from "@/lang/useTranslation";

// Lives outside the list <Suspense> so the <h1> is in the first HTML byte.
// categoryName comes from the page (category endpoint), not from the blogs
// list, so it never waits on the list fetch. The breadcrumb takes the same
// prop directly in Blogs.jsx — no dispatch needed.
const BlogsHeading = ({ categoryName }) => {
  const { t } = useTranslation();
  return (
    <h1 className="text-2xl font-medium">
      {categoryName ? `${categoryName} ${t("blogs")}` : t("ourBlogs")}
    </h1>
  );
};

export default BlogsHeading;
