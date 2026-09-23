import { cn } from "@/lib/utils";
import { useTranslation } from "@/lang/useTranslation";
import { categoryApi } from "@/lib/api";
import { CircleNotchIcon, MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { useUpdateLocationInUrl } from "@/hooks/useUpdateLocationInUrl";

const CategoryNode = ({ category, slugPath, onCategorySelect }) => {
  const { t } = useTranslation();
  const { navigate } = useNavigate();
  const pathname = usePathname();
  const { categorySlug } = useParams();
  const { generateAdsUrl } = useUpdateLocationInUrl();
  const isAdsPage = pathname.includes("/ads");

  const [expanded, setExpanded] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const currentSlug = categorySlug ? categorySlug.join("/") : "";
  const isSelected = slugPath === currentSlug;

  const fetchSubcategories = async (page = 1, append = false) => {
    setIsLoading(true);
    try {
      const response = await categoryApi.getCategory({
        category_id: category.id,
        page,
      });
      const data = response.data.data.data;
      const hasMore =
        response.data.data.last_page > response.data.data.current_page;
      setSubcategories((prev) => (append ? [...prev, ...data] : data));
      setHasMore(hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleExpand = async () => {
    if (!expanded && subcategories.length === 0) {
      await fetchSubcategories();
    }
    setExpanded((prev) => !prev);
  };

  const handleClick = () => {
    const url = generateAdsUrl({ category: slugPath }, !isAdsPage);
    navigate(url);
    onCategorySelect?.();
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchSubcategories(nextPage, true);
  };

  return (
    <li>
      <div className="flex items-center rounded text-sm">
        {category.subcategories_count > 0 &&
          (isLoading ? (
            <div className="p-1">
              <CircleNotchIcon className="size-3.5 animate-spin text-muted-foreground" weight="bold" />
            </div>
          ) : (
            <button
              className="text-sm p-1 hover:bg-muted rounded-sm"
              onClick={handleToggleExpand}
            >
              {expanded ? <MinusIcon size={14} /> : <PlusIcon size={14} />}
            </button>
          ))}

        <button
          onClick={handleClick}
          className={cn(
            "flex-1 ltr:text-left rtl:text-right py-1 px-2 rounded-sm flex items-center justify-between gap-2",
            isSelected && "border bg-muted"
          )}
        >
          <span className="break-all">{category.translated_name}</span>
          <span>({category.all_items_count})</span>
        </button>
      </div>

      {expanded && (
        <ul className="ltr:ml-3 rtl:mr-3 ltr:border-l rtl:border-r ltr:pl-2 rtl:pr-2 space-y-1">
          {subcategories.map((sub) => (
            <CategoryNode
              key={sub.id + "filter-tree"}
              category={sub}
              slugPath={`${slugPath}/${sub.slug}`}
              onCategorySelect={onCategorySelect}
            />
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              className="text-primary text-center text-sm py-1 px-2"
            >
              {t("loadMore")}
            </button>
          )}
        </ul>
      )}
    </li>
  );
};

export default CategoryNode;
