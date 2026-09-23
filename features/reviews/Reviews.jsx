"use client";
import { useTranslation } from "@/lang/useTranslation";
import { useEffect, useState } from "react";
import { getMyPurchasedItemsApi, getMyReviewsApi } from "@/lib/api";
import ReceivedReviewsList from "@/features/reviews/received/ReceivedReviewsList";
import GivenReviewsList from "@/features/reviews/given/GivenReviewsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import { toast } from "sonner";

const Reviews = () => {
  const { t } = useTranslation();
  const [MyReviews, setMyReviews] = useState();
  const [AverageRating, setAverageRating] = useState("");
  const [RatingsCount, setRatingsCount] = useState({});
  const [CurrentPage, setCurrentPage] = useState(1);
  const [ReviewHasMore, setReviewHasMore] = useState(false);
  const [IsLoading, setIsLoading] = useState(false);
  const [IsLoadMore, setIsLoadMore] = useState(false);
  const [Purchased, setPurchased] = useState({
    items: undefined,
    page: 1,
    hasMore: false,
    isLoading: false,
    isLoadMore: false,
  });
  const { lang: langCode } = useParams();

  const getReveiws = async (page) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      }
      const res = await getMyReviewsApi.getMyReviews({ page });
      if (res?.data?.error === false) {
        setAverageRating(
          res?.data?.data?.average_rating != null
            ? Number(res.data.data.average_rating).toFixed(1)
            : res?.data?.data?.average_rating
        );
        setMyReviews((prev) =>
          page === 1
            ? res?.data?.data?.ratings?.data
            : [...(prev || []), ...(res?.data?.data?.ratings?.data || [])]
        );
        setRatingsCount(res?.data?.data?.ratings_count);
        setCurrentPage(res?.data?.data?.ratings?.current_page);
        setReviewHasMore(
          res?.data?.data?.ratings?.current_page <
          res?.data?.data?.ratings?.last_page
        );
      } else {
        toast.error(t("somethingWentWrong"))
      }
    } catch (error) {
      console.log(error);
      toast.error(t("somethingWentWrong"))
    } finally {
      setIsLoading(false);
      setIsLoadMore(false);
    }
  };

  const getPurchasedItems = async (page) => {
    try {
      setPurchased((prev) => ({
        ...prev,
        isLoading: page === 1,
        isLoadMore: page !== 1,
      }));
      const res = await getMyPurchasedItemsApi.getMyPurchasedItems({ page });
      if (res?.data?.error === false) {
        const pagination = res?.data?.data;
        setPurchased((prev) => ({
          ...prev,
          items:
            page === 1
              ? pagination?.data
              : [...(prev.items || []), ...(pagination?.data || [])],
          page: pagination?.current_page ?? page,
          hasMore: (pagination?.current_page ?? page) < (pagination?.last_page ?? page),
          isLoading: false,
          isLoadMore: false,
        }));
      } else {
        setPurchased((prev) => ({ ...prev, isLoading: false, isLoadMore: false }));
        toast.error(t("somethingWentWrong"));
      }
    } catch (error) {
      console.log(error);
      setPurchased((prev) => ({ ...prev, isLoading: false, isLoadMore: false }));
      toast.error(t("somethingWentWrong"));
    }
  };

  useEffect(() => {
    getReveiws(1);
    getPurchasedItems(1);
  }, [langCode]);

  const handleReviewLoadMore = () => {
    setIsLoadMore(true);
    getReveiws(CurrentPage + 1);
  };

  const handlePurchasedLoadMore = () => {
    getPurchasedItems(Purchased.page + 1);
  };

  const handleItemReviewed = (itemId, review) => {
    setPurchased((prev) => ({
      ...prev,
      items: prev.items?.map((item) =>
        item?.id === itemId ? { ...item, review } : item
      ),
    }));
  };

  return (
    <Tabs defaultValue="received">
      <TabsList className="grid w-full grid-cols-2 h-auto">
        <TabsTrigger value="received" className="w-full text-sm sm:text-base">
          {t("received")}
        </TabsTrigger>
        <TabsTrigger value="given" className="w-full text-sm sm:text-base">
          {t("given")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="received" className="mt-6">
        <ReceivedReviewsList
          reviews={MyReviews}
          setReviews={setMyReviews}
          averageRating={AverageRating}
          ratingsCount={RatingsCount}
          isLoading={IsLoading}
          isLoadMore={IsLoadMore}
          hasMore={ReviewHasMore}
          onLoadMore={handleReviewLoadMore}
        />
      </TabsContent>

      <TabsContent value="given" className="mt-6">
        <GivenReviewsList
          items={Purchased.items}
          isLoading={Purchased.isLoading}
          isLoadMore={Purchased.isLoadMore}
          hasMore={Purchased.hasMore}
          onLoadMore={handlePurchasedLoadMore}
          onReviewed={handleItemReviewed}
        />
      </TabsContent>
    </Tabs>
  );
};

export default Reviews;
