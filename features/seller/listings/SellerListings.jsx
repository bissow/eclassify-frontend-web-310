"use client";
import { useState } from "react";
import { getItemListApi } from "@/lib/api";
import AdCard from "@/components/common/AdCard";
import NoData from "@/components/empty-states/NoData";
import AdHorizontalCard from "@/components/common/AdHorizontalCard";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lang/useTranslation";

// Page 1 is server-rendered and arrives as props; this component only owns
// "load more". Sort/view controls live in SellerListingsToolbar, outside the
// Suspense boundary, so they survive a sort change. The parent remounts this
// component (key) on sort, re-seeding the initial* props.
const SellerListings = ({
  id,
  initialItems = [],
  initialCurrentPage = 1,
  initialHasMore = false,
}) => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "grid";
  const sortBy = searchParams.get("sort") || "default";

  const [sellerItems, setSellerItems] = useState(initialItems);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isSellerItemLoadMore, setIsSellerItemLoadMore] = useState(false);

  const handleProdLoadMore = async () => {
    try {
      setIsSellerItemLoadMore(true);
      const res = await getItemListApi.getItemsList({
        user_id: id,
        limit: 12,
        ...(sortBy !== "default" && { sort_by: sortBy }),
        page: currentPage + 1,
      });
      setSellerItems((prevItems) => [
        ...prevItems,
        ...(res?.data?.data?.data ?? []),
      ]);
      setCurrentPage(res?.data?.data?.current_page);
      setHasMore(res?.data?.data?.current_page < res?.data?.data?.last_page);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSellerItemLoadMore(false);
    }
  };

  const handleLike = (id, liked) => {
    setSellerItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_liked: liked } : item))
    );
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        {sellerItems && sellerItems.length > 0 ? (
          sellerItems?.map((item, index) =>
            view === "list" ? (
              <div className="col-span-12" key={index}>
                <AdHorizontalCard item={item} handleLike={handleLike} />
              </div>
            ) : (
              <div className="col-span-6 lg:col-span-4" key={index}>
                <AdCard item={item} handleLike={handleLike} />
              </div>
            )
          )
        ) : (
          <div className="col-span-12">
            <NoData title={t("noAdsFound")} />
          </div>
        )}
      </div>

      {sellerItems && sellerItems.length > 0 && hasMore && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            className="text-sm sm:text-base text-primary w-[256px]"
            disabled={isSellerItemLoadMore}
            onClick={handleProdLoadMore}
          >
            {isSellerItemLoadMore ? t("loading") : t("loadMore")}
          </Button>
        </div>
      )}
    </>
  );
};

export default SellerListings;
