"use client";
import CustomImage from "@/components/common/CustomImage";
import StarRating from "@/components/common/StarRating";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation, useLocale } from "@/lang/useTranslation";
import { timeAgo } from "@/lib/format";
import { REVIEW_CLAMP_LENGTH } from "@/lib/constants";
import { useState } from "react";

const PurchasedItemCard = ({ item, onGiveReview }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);
  const review = item?.review;
  const fullReview = review?.review?.trim() || "";
  const isOverflowing = fullReview.length > REVIEW_CLAMP_LENGTH;
  const visibleReview =
    isOverflowing && !isExpanded
      ? `${fullReview.slice(0, REVIEW_CLAMP_LENGTH).trimEnd()}...`
      : fullReview;

  return (
    <div className="bg-white p-4 rounded-lg flex gap-4">
      <CustomImage
        src={item?.image}
        width={72}
        height={72}
        alt={item?.translation?.name || "Item"}
        className="size-12 sm:size-16 aspect-square rounded-lg object-cover shrink-0!"
      />

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm sm:text-base font-semibold line-clamp-1">
            {item?.translation?.name}
          </p>
          {review?.created_at && (
            <p className="text-xs sm:text-sm text-muted-foreground shrink-0">
              {timeAgo(review?.created_at, locale, t)}
            </p>
          )}
        </div>

        {review ? (
          <>
            <StarRating
              rating={Number(review?.ratings)}
              className="size-4 sm:size-5"
            />
            {fullReview && (
              <p className="text-xs sm:text-sm">
                {visibleReview}
                {isOverflowing && (
                  <>
                    {" "}
                    <button
                      onClick={() => setIsExpanded((prev) => !prev)}
                      className="text-primary font-medium hover:underline"
                    >
                      {isExpanded ? t("seeLess") : t("seeMore")}
                    </button>
                  </>
                )}
              </p>
            )}
          </>
        ) : (
          <button
            onClick={() => onGiveReview?.(item)}
            className="text-primary text-xs sm:text-sm font-medium hover:underline w-fit"
          >
            {t("rateNow")}
          </button>
        )}
      </div>
    </div>
  );
};

export const PurchasedItemCardSkeleton = () => (
  <div className="p-2 sm:p-4 bg-muted rounded-xl flex flex-col gap-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        className="bg-white p-4 rounded-lg flex gap-4"
        key={`purchased-skeleton-${index}`}
      >
        <Skeleton className="size-12 sm:size-16 rounded-lg shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-4 w-10 rounded-md" />
          </div>
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-4 w-48 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

export default PurchasedItemCard;
