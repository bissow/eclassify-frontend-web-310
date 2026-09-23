"use client";
import CustomLink from "@/components/common/CustomLink";
import CustomImage from "@/components/common/CustomImage";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useTranslation } from "@/lang/useTranslation";

const BlogCard = ({ blog }) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 rounded-3xl flex flex-col gap-4 border bg-white h-full">
      <CustomImage
        src={blog?.image}
        alt={blog?.translated_title || "Blog image"}
        className="w-full object-cover rounded-[8px] aspect-388/200"
        width={378}
        height={195}
      />
      <h5 className="text-lg font-semibold truncate">
        {blog?.translated_title || blog?.title}
      </h5>
      <p className="opacity-65 line-clamp-2">
        {(blog?.translated_description || blog?.description)?.replace(/<[^>]*>/g, "") ?? ""}
      </p>
      <CustomLink
        href={`/blogs/${blog?.slug}`}
        className="flex items-center gap-3 text-primary text-lg mt-auto"
      >
        <span>{t("readArticle")}</span>
        <ArrowRightIcon className="rtl:scale-x-[-1]" size={20} weight="bold" />
      </CustomLink>
    </div>
  );
};

export default BlogCard;
