"use client";
import { useTranslation } from "@/lang/useTranslation";
import BlogCard from "@/components/common/BlogCard";

const RelatedArticles = ({ blogs = [] }) => {
  const { t } = useTranslation();
  if (!blogs?.length) return null;

  return (
    <div className="flex gap-8 flex-col">
      <h2 className="text-2xl font-medium">{t("relatedArticle")}</h2>
      <div className="grid md:grid-cols-12 grid-cols-1 gap-4">
        {blogs.map((blog, index) => (
          <div className="md:col-span-4 col-span-12" key={index}>
            <BlogCard blog={blog} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedArticles;
