"use client";
import PurchasedItemCard, {
  PurchasedItemCardSkeleton,
} from "@/features/reviews/given/PurchasedItemCard";
import GiveReviewModal from "@/features/reviews/given/GiveReviewModal";
import { Button } from "@/components/ui/button";
import NoData from "@/components/empty-states/NoData";
import { useTranslation } from "@/lang/useTranslation";
import { useState } from "react";

const GivenReviewsList = ({
  items,
  isLoading,
  isLoadMore,
  hasMore,
  onLoadMore,
  onReviewed,
}) => {
  const { t } = useTranslation();
  const [ReviewItem, setReviewItem] = useState(null);

  if (isLoading) {
    return <PurchasedItemCardSkeleton />;
  }

  if (!items || items.length === 0) {
    return <NoData title={t("noPurchasedItemsFound")} />;
  }

  return (
    <>
      <div className="p-2 sm:p-4 bg-muted rounded-xl flex flex-col gap-4">
        {items?.map((item) => (
          <PurchasedItemCard
            item={item}
            key={item?.id}
            onGiveReview={setReviewItem}
          />
        ))}
      </div>

      <GiveReviewModal
        isOpen={Boolean(ReviewItem)}
        setIsOpen={(open) => !open && setReviewItem(null)}
        item={ReviewItem}
        onReviewed={onReviewed}
      />
      {hasMore && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            className="text-sm sm:text-base text-primary w-[256px]"
            disabled={isLoadMore}
            onClick={onLoadMore}
          >
            {isLoadMore ? t("loading") : t("loadMore")}
          </Button>
        </div>
      )}
    </>
  );
};

export default GivenReviewsList;
