"use client";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { getAdsView, setAdsView } from "@/store/slices/globalStateSlice";
import { useTranslateLocationInUrl } from "@/features/location/hooks/useTranslateLocationInUrl";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowsDownUpIcon, SquaresFourIcon, RowsIcon } from "@phosphor-icons/react";
import { useNavigate } from "@/hooks/useNavigate";
import { useAdsBasePath } from "@/hooks/useAdsBasePath";
import { useTranslation } from "@/lang/useTranslation";

const SORT_OPTIONS = [
  { value: "default", label: "default" },
  { value: "new-to-old", label: "newestToOldest" },
  { value: "old-to-new", label: "oldestToNewest" },
  { value: "price-high-to-low", label: "priceHighToLow" },
  { value: "price-low-to-high", label: "priceLowToHigh" },
  { value: "popular_items", label: "popular" },
];

// Rendered outside the listing's Suspense boundary so it stays put while a new
// sort or filter set streams in. grid/list is presentation only and must not
// touch the URL — it goes through redux, which is also how it reaches AdsGrid
// across the server component between them.
const AdsToolbar = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const basePath = useAdsBasePath();
  const { navigate } = useNavigate();
  const dispatch = useDispatch();
  const view = useSelector(getAdsView);
  const sortBy = searchParams.get("sort_by") || "default";

  // Owned here because this is the one client component on the page that never
  // unmounts — the listing below is remounted on every filter change.
  useTranslateLocationInUrl();

  const handleSortBy = (value) => {
    const next = new URLSearchParams(searchParams);
    // "default" is the absence of a sort — keep it out of the URL so the
    // canonical listing has one address instead of two.
    value === "default" ? next.delete("sort_by") : next.set("sort_by", value);
    const query = next.toString();
    navigate(query ? `${basePath}?${query}` : basePath, { scroll: false });
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
        <div className="hidden md:flex gap-2 items-center whitespace-nowrap">
          <ArrowsDownUpIcon weight="bold" />
          {t("sortBy")}
        </div>
        <Select value={sortBy} onValueChange={handleSortBy}>
          <SelectTrigger className="font-semibold">
            <SelectValue placeholder={t("sortBy")} className="font-semibold" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup className="font-semibold">
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.label)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => dispatch(setAdsView("list"))}
          aria-label={t("list")}
          className={`text-muted-foreground p-2 sm:p-3 rounded-full ${view === "list" ? "bg-primary text-white" : ""
            }`}
        >
          <RowsIcon className="size-4 sm:size-5" weight={view === "list" ? "fill" : "regular"} />
        </button>
        <button
          onClick={() => dispatch(setAdsView("grid"))}
          aria-label={t("grid")}
          className={`text-muted-foreground p-2 sm:p-3 rounded-full ${view === "grid" ? "bg-primary text-white" : ""
            }`}
        >
          <SquaresFourIcon className="size-4 sm:size-5" weight={view === "grid" ? "fill" : "regular"} />
        </button>
      </div>
    </div>
  );
};

export default AdsToolbar;
