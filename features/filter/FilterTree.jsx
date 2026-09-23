import { cn } from "@/lib/utils";
import { CircleNotchIcon, MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { useParams, usePathname } from "next/navigation";
import { useTranslation } from "@/lang/useTranslation";
import CategoryNode from "@/features/filter/CategoryNode";
import { useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import useGetCategories from "@/components/layout/useGetCategories";
import { useUpdateLocationInUrl } from "@/hooks/useUpdateLocationInUrl";

const FilterTree = ({ onCategorySelect }) => {
  const { t } = useTranslation();
  const { navigate } = useNavigate();
  const pathname = usePathname();
  const { categorySlug } = useParams();
  const { generateAdsUrl } = useUpdateLocationInUrl();
  const isAdsPage = pathname.includes("/ads");

  const {
    getCategories,
    cateData,
    isCatLoading,
    isCatLoadMore,
    catCurrentPage,
    catLastPage,
  } = useGetCategories();
  const hasMore = catCurrentPage < catLastPage;

  const isSelected = !categorySlug;

  const [expanded, setExpanded] = useState(true);

  const handleToggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  const handleClick = () => {
    const url = generateAdsUrl({}, !isAdsPage);
    navigate(url);
    onCategorySelect?.();
  };

  return (
    <ul>
      <li>
        <div className="flex items-center rounded text-sm">
          {isCatLoading ? (
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
          )}

          <button
            onClick={handleClick}
            className={cn(
              "flex-1 ltr:text-left rtl:text-right py-1 px-2 rounded-sm",
              isSelected && "border bg-muted"
            )}
          >
            {t("allCategories")}
          </button>
        </div>
        {expanded && cateData.length > 0 && (
          <ul className="ltr:ml-3 rtl:mr-3 ltr:border-l rtl:border-r ltr:pl-2 rtl:pr-2 space-y-1">
            {cateData.map((category) => (
              <CategoryNode
                key={category.id + "filter-tree"}
                category={category}
                slugPath={category.slug}
                onCategorySelect={onCategorySelect}
              />
            ))}
            {hasMore && (
              <button
                onClick={() => getCategories(catCurrentPage + 1)}
                className="text-primary text-center text-sm py-1 px-2"
                disabled={isCatLoadMore}
              >
                {isCatLoadMore ? t("loading") : t("loadMore")}
              </button>
            )}
          </ul>
        )}
      </li>
    </ul>
  );
};

export default FilterTree;
