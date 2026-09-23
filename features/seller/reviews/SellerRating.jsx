"use client";
import { useState } from "react";
import { useTranslation } from "@/lang/useTranslation";
import { getSellerApi } from "@/lib/api";
import RatingsSummary from '@/components/common/RatingsSummary';
import SellerReviewCard from "@/features/seller/reviews/SellerReviewCard";
import { Button } from '@/components/ui/button';
import NoData from '@/components/empty-states/NoData';

// Page 1 of the reviews is server-rendered and arrives as props; this component
// only owns "load more".
const SellerRating = ({ id, initialRatings, averageRating, ratings_count }) => {
    const { t } = useTranslation();
    const [reviews, setReviews] = useState(initialRatings?.data || []);
    const [currentPage, setCurrentPage] = useState(initialRatings?.current_page || 1);
    const [hasMore, setHasMore] = useState(
        (initialRatings?.current_page || 1) < (initialRatings?.last_page || 1)
    );
    const [isLoadMoreReview, setIsLoadMoreReview] = useState(false);

    const handleLoadMore = async () => {
        try {
            setIsLoadMoreReview(true);
            const res = await getSellerApi.getSeller({
                id: Number(id),
                page: currentPage + 1,
            });
            const ratings = res?.data?.data?.ratings;
            setReviews((prev) => [...prev, ...(ratings?.data ?? [])]);
            setCurrentPage(ratings?.current_page);
            setHasMore(ratings?.current_page < ratings?.last_page);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadMoreReview(false);
        }
    };

    return (
        reviews?.length > 0 ?
            <>
                <RatingsSummary averageRating={averageRating} ratings_count={ratings_count} />
                <div className='flex flex-col gap-4 bg-muted p-4 rounded-lg'>
                    {reviews?.map((rating) => (
                        <SellerReviewCard key={rating.id} rating={rating} />
                    ))}
                    {
                        hasMore && (
                            <div className="text-center">
                                <Button
                                    variant="outline"
                                    className="text-sm sm:text-base text-primary w-[256px]"
                                    disabled={isLoadMoreReview}
                                    onClick={handleLoadMore}
                                >
                                    {isLoadMoreReview ? t("loading") : t("loadMore")}
                                </Button>
                            </div>
                        )
                    }
                </div>
            </>
            :
            <NoData title={t('noReviewsFound')} />
    );
};

export default SellerRating;
