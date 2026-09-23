"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "next/navigation";
import { useNavigate } from "@/hooks/useNavigate";
import { useTranslation } from "@/lang/useTranslation";
import { ArrowsDownUpIcon, RowsIcon, SquaresFourIcon } from "@phosphor-icons/react";

// Rendered outside the listings Suspense boundary: it's URL-state UI, not data
// UI, so it must stay on screen (and interactive) while a new sort streams in.
const SellerListingsToolbar = ({ id }) => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const { navigate, pushState } = useNavigate();
  const view = searchParams.get("view") || "grid";
  const sortBy = searchParams.get("sort") || "default";

  // View is presentation only — no refetch, so keep it out of the router.
  const toggleView = (newView) => {
    const params = new URLSearchParams(searchParams);
    params.set("view", newView);
    pushState(`/seller/${id}?${params.toString()}`);
  };

  // Sort changes the data — navigate re-runs the server section.
  const handleSortBy = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    navigate(`/seller/${id}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex items-center gap-1">
          <ArrowsDownUpIcon size={16} />
          <span className="whitespace-nowrap">{t("sortBy")}</span>
        </div>
        <Select value={sortBy} onValueChange={handleSortBy}>
          <SelectTrigger>
            <SelectValue placeholder={t("sortBy")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="default">
                {t("default")}
              </SelectItem>
              <SelectItem value="new-to-old">
                {t("newestToOldest")}
              </SelectItem>
              <SelectItem value="old-to-new">
                {t("oldestToNewest")}
              </SelectItem>
              <SelectItem value="price-high-to-low">
                {t("priceHighToLow")}
              </SelectItem>
              <SelectItem value="price-low-to-high">
                {t("priceLowToHigh")}
              </SelectItem>
              <SelectItem value="popular_items">{t("popular")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => toggleView("grid")}
          className={`flex items-center justify-center size-8 sm:size-10 text-muted-foreground transition-colors duration-300 cursor-pointer gap-2 rounded-full ${view === "grid"
            ? "bg-primary text-white"
            : "hover:text-black"
            }`}
        >
          <SquaresFourIcon className="size-5 sm:size-6" weight={view === "grid" ? "fill" : "regular"} />
        </button>
        <button
          onClick={() => toggleView("list")}
          className={`flex items-center justify-center size-8 sm:size-10 text-muted-foreground transition-colors duration-300 cursor-pointer gap-2 rounded-full ${view === "list"
            ? "bg-primary text-white"
            : "hover:text-black"
            }`}
        >
          <RowsIcon className="size-5 sm:size-6" weight={view === "list" ? "fill" : "regular"} />
        </button>
      </div>
    </div>
  );
};

export default SellerListingsToolbar;
