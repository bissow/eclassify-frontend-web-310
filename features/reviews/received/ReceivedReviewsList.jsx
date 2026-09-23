"use client";
import RatingsSummary from "@/components/common/RatingsSummary";
import RatingsSummarySkeleton from "@/features/reviews/received/RatingsSummarySkeleton";
import MyReviewsCard from "@/features/reviews/received/MyReviewsCard.jsx";
import MyReviewsCardSkeleton from "@/features/reviews/received/MyReviewsCardSkeleton";
import { Button } from "@/components/ui/button";
import NoData from "@/components/empty-states/NoData";
import { useTranslation } from "@/lang/useTranslation";

const ReceivedReviewsList = ({
  reviews,
  setReviews,
  averageRating,
  ratingsCount,
  isLoading,
  isLoadMore,
  hasMore,
  onLoadMore,
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <>
        <RatingsSummarySkeleton />
        <MyReviewsCardSkeleton />
      </>
    );
  }

  if (!reviews || reviews.length === 0) {
    return <NoData title={t("noReviewsFound")} />;
  }

  return (
    <>
      <RatingsSummary averageRating={averageRating} ratings_count={ratingsCount} />
      <div className="mt-7.5 p-2 sm:p-4 bg-muted rounded-xl flex flex-col gap-7.5">
        {reviews?.map((rating) => (
          <MyReviewsCard
            rating={rating}
            key={rating?.id}
            setMyReviews={setReviews}
          />
        ))}
      </div>
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

export default ReceivedReviewsList;
