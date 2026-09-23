"use client";
import AdCard from "@/components/common/AdCard";
import ReelCard from "@/components/common/ReelCard";
import NoData from "@/components/empty-states/NoData";
import AdCardSkeleton from "@/components/common/AdCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lang/useTranslation";
import { getFavouriteApi, getLikedReelsApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const REELS_PER_PAGE = 9;

const Favorites = () => {
  const { t } = useTranslation();
  const { lang: langCode } = useParams();
  const [activeTab, setActiveTab] = useState("regular");
  const [favoritesData, setFavoriteData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [IsLoadMore, setIsLoadMore] = useState(false);

  const [reelsState, setReelsState] = useState({
    data: [],
    isLoading: false,
    isLoadMore: false,
    currentPage: 1,
    hasMore: false,
  });

  const fetchFavoriteItems = async (page) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      }
      const response = await getFavouriteApi.getFavouriteApi({ page, per_page: 12 });
      const data = response?.data?.data?.data;
      if (page === 1) {
        setFavoriteData(data);
      } else {
        setFavoriteData((prevData) => [...prevData, ...data]);
      }
      setCurrentPage(response?.data?.data.current_page);
      if (response?.data?.data.current_page < response?.data?.data.last_page) {
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setIsLoadMore(false);
    }
  };

  useEffect(() => {
    fetchFavoriteItems(currentPage);
  }, [currentPage, langCode]);

  const handleLoadMore = () => {
    setIsLoadMore(true);
    setCurrentPage((prevPage) => prevPage + 1);
  };

  // Row stays in favoritesData either way — the grid below already hides
  // items where is_liked is false. Keeping the row (instead of splicing it
  // out) is what lets a failed-unlike rollback restore it correctly.
  const handleLike = (id, liked) => {
    setFavoriteData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_liked: liked } : item))
    );
  };

  const fetchLikedReels = async (page) => {
    setReelsState((prev) => ({
      ...prev,
      isLoading: page === 1,
      isLoadMore: page !== 1,
    }));
    try {
      const response = await getLikedReelsApi.getLikedReels({ page, per_page: REELS_PER_PAGE });
      const data = response?.data?.data;
      const newReels = data?.data || [];
      setReelsState((prev) => ({
        ...prev,
        data: page === 1 ? newReels : [...prev.data, ...newReels],
        currentPage: data?.current_page,
        hasMore: data?.current_page < data?.last_page,
      }));
    } catch (error) {
      console.log(error);
    } finally {
      setReelsState((prev) => ({ ...prev, isLoading: false, isLoadMore: false }));
    }
  };

  useEffect(() => {
    if (activeTab === "video" && reelsState.data.length === 0) {
      fetchLikedReels(1);
    }
  }, [activeTab, langCode]);

  const handleLoadMoreReels = () => {
    fetchLikedReels(reelsState.currentPage + 1);
  };

  return (
    <div>
      <div className="flex w-full items-center gap-1 rounded-md bg-muted p-4 text-muted-foreground">
        <button
          type="button"
          onClick={() => setActiveTab("regular")}
          className={cn(
            "rounded-sm px-3 py-2 text-sm font-medium transition-all",
            activeTab === "regular" && "bg-primary text-white shadow-xs"
          )}
        >
          {t("regularAds")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("video")}
          className={cn(
            "rounded-sm px-4 py-2 text-sm font-medium transition-all",
            activeTab === "video" && "bg-primary text-white shadow-xs"
          )}
        >
          {t("videoAds")}
        </button>
      </div>

      {activeTab === "regular" ? (
        <div className="mt-4">
          <div className="grid grid-cols-2 xl:grid-cols-3 lg:grid-cols-2 gap-3 sm:gap-6">
            {isLoading ? (
              [...Array(12)].map((_, index) => <AdCardSkeleton key={index} />)
            ) : favoritesData && favoritesData.length > 0 ? (
              favoritesData?.map(
                (fav) =>
                  fav?.is_liked && (
                    <AdCard key={fav?.id} item={fav} handleLike={handleLike} />
                  )
              )
            ) : (
              <div className="col-span-full">
                <NoData title={t("noFavoritesFound")} />
              </div>
            )}
          </div>
          {favoritesData && favoritesData.length > 0 && hasMore && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                className="text-sm sm:text-base text-primary w-[256px]"
                disabled={isLoading || IsLoadMore}
                onClick={handleLoadMore}
              >
                {IsLoadMore ? t("loading") : t("loadMore")}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <div className="grid grid-cols-2 xl:grid-cols-3 lg:grid-cols-2 gap-3 sm:gap-6">
            {reelsState.isLoading ? (
              [...Array(12)].map((_, index) => (
                <Skeleton key={index} className="w-full aspect-9/16 rounded-xl" />
              ))
            ) : reelsState.data && reelsState.data.length > 0 ? (
              reelsState.data.map((reel) => <ReelCard key={reel?.id} item={reel} />)
            ) : (
              <div className="col-span-full">
                <NoData title={t("noReelsFound")} />
              </div>
            )}
          </div>
          {reelsState.data && reelsState.data.length > 0 && reelsState.hasMore && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                className="text-sm sm:text-base text-primary w-[256px]"
                disabled={reelsState.isLoading || reelsState.isLoadMore}
                onClick={handleLoadMoreReels}
              >
                {reelsState.isLoadMore ? t("loading") : t("loadMore")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Favorites;
