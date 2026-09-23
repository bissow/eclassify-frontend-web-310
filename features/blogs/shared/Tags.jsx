"use client";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lang/useTranslation";
import { useNavigate } from "@/hooks/useNavigate";

// Tags are server-fetched (sections/TagsSection) — this only owns navigation.
const Tags = ({ tag, blogTags = [], categorySlug }) => {
  const { t } = useTranslation();
  const { navigate } = useNavigate();

  const basePath = categorySlug ? `/blogs/category/${categorySlug}` : "/blogs";
  const isAllTagActive = !tag;

  const handleAllTags = () => {
    navigate(basePath, { scroll: false });
  };

  const handleTagClick = (tagItem) => {
    navigate(`${basePath}?tag=${tagItem}`);
  };

  return (
    <div className="flex flex-col border rounded-lg ">
      <div className="p-4">
        <p className="font-bold">{t("tags")}</p>
      </div>
      <div className="border-b w-full"></div>
      <div className="p-4 flex flex-wrap gap-2">
        <button
          className={cn(
            "border px-4 text-sm py-2 rounded-md hover:bg-primary/10 transition-colors",
            isAllTagActive && "bg-primary/10 text-primary font-semibold"
          )}
          onClick={handleAllTags}
        >
          {t("all")}
        </button>

        {blogTags?.map((tagItem) => (
          <button
            key={tagItem.value}
            className={cn(
              "border px-4 text-sm py-2 rounded-md break-all hover:bg-primary/10 transition-colors",
              tag === String(tagItem.value) && "bg-primary/10 text-primary font-semibold"
            )}
            onClick={() => handleTagClick(tagItem.value)}
          >
            {tagItem.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tags;
