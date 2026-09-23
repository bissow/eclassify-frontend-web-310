"use client";
import { useState } from "react";
import AdCard from "@/components/common/AdCard";
import AdHorizontalCard from "@/components/common/AdHorizontalCard";
import NoData from "@/components/empty-states/NoData";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { getItemListApi } from "@/lib/api";
import { getAdsView } from "@/store/slices/globalStateSlice";
import { useTranslation } from "@/lang/useTranslation";

// Page 1 is server-rendered and arrives as props; this component only owns
// "load more" and the optimistic like toggle. Filter and sort changes are URL
// navigations handled by the server, which remounts this via its key.
const AdsGrid = ({
  listParams,
  initialItems = [],
  initialCurrentPage = 1,
  initialHasMore = false,
}) => {
  const { t } = useTranslation();
  const view = useSelector(getAdsView);
  const [items, setItems] = useState(initialItems);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadMore, setIsLoadMore] = useState(false);

  const handleLoadMore = async () => {
    try {
      setIsLoadMore(true);
      // Spread the exact params the server used for page 1 — the client never
      // re-derives filter logic, so the two pages cannot disagree.
      const res = await getItemListApi.getItemsList({
        ...listParams,
        page: currentPage + 1,
      });
      const data = res?.data?.data;
      if (!data) return;
      setItems((prev) => [...prev, ...(data.data ?? [])]);
      setCurrentPage(data.current_page);
      setHasMore(data.current_page < data.last_page);
    } catch (error) {
      console.error("Error loading more ads:", error);
    } finally {
      setIsLoadMore(false);
    }
  };

  const handleLike = (id, liked) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_liked: liked } : item))
    );
  };

  if (!items.length) {
    return <NoData title={t("noAdsFound")} />;
  }

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        {items.map((item) =>
          view === "list" ? (
            <div className="col-span-12" key={item.id}>
              <AdHorizontalCard item={item} handleLike={handleLike} />
            </div>
          ) : (
            <div
              className="col-span-6 md:col-span-4 lg:col-span-6 xl:col-span-4 2xl:col-span-3"
              key={item.id}
            >
              <AdCard item={item} handleLike={handleLike} />
            </div>
          )
        )}
      </div>
      {hasMore && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            className="text-sm sm:text-base text-primary w-[256px]"
            disabled={isLoadMore}
            onClick={handleLoadMore}
          >
            {isLoadMore ? t("loading") : t("loadMore")}
          </Button>
        </div>
      )}
    </>
  );
};

export default AdsGrid;
