"use client";
import AdCard from "@/components/common/AdCard";
import NoData from "@/components/empty-states/NoData";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lang/useTranslation";
import { getItemListApi } from "@/lib/api";
import { useState } from "react";
import SectionBanners from "@/components/custom-banners/SectionBanners";
import { InfoIcon } from "@phosphor-icons/react";

const AllItems = ({
  initialItems,
  initialLocationAlertMessage,
  initialCurrentPage,
  initialHasMore,
  initialCityData,
  initialKmRange,
  aboveBanners,
  belowBanners,
}) => {
  const { t } = useTranslation();
  const [AllItem, setAllItem] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [locationAlertMessage, setLocationAlertMessage] = useState(
    initialLocationAlertMessage
  );

  // Only handles "Load More" (page 2+) — page 1 is server-fetched
  // (AllItemsSection.jsx) using the same location params.
  const getAllItemData = async (page) => {
    try {
      const params = { page, current_page: "home" };
      if (
        Number(initialKmRange) > 0 &&
        (initialCityData?.areaId || initialCityData?.city)
      ) {
        params.radius = initialKmRange;
        params.latitude = initialCityData.lat;
        params.longitude = initialCityData.long;
      } else if (initialCityData?.areaId) {
        params.area_id = initialCityData.areaId;
      } else if (initialCityData?.city) {
        params.city = initialCityData.city;
      } else if (initialCityData?.state) {
        params.state = initialCityData.state;
      } else if (initialCityData?.country) {
        params.country = initialCityData.country;
      }

      const response = await getItemListApi.getItemsList(params);
      if (response.data?.error === true) {
        throw new Error(response.data?.message);
      }

      const apiMessage = response.data.message;
      const isNoItemsInLocation = apiMessage
        ?.toLowerCase()
        .includes("no ads found");

      if (isNoItemsInLocation && response?.data?.data?.data?.length > 0) {
        setLocationAlertMessage(apiMessage);
      } else {
        setLocationAlertMessage("");
      }

      if (response?.data?.data?.data?.length > 0) {
        const data = response?.data?.data?.data;
        setAllItem((prevData) => [...prevData, ...data]);
        const newCurrentPage = response?.data?.data?.current_page;
        const lastPage = response?.data?.data?.last_page;
        setHasMore(newCurrentPage < lastPage);
        setCurrentPage(newCurrentPage);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoadMore(false);
    }
  };

  const handleLoadMore = () => {
    setIsLoadMore(true);
    getAllItemData(currentPage + 1);
  };

  const handleLikeAllData = (id, liked) => {
    setAllItem((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_liked: liked } : item))
    );
  };

  return (
    <section className="mt-12">
      <SectionBanners banners={aboveBanners} className="mb-6 sm:mb-12" />
      <h5 className="text-xl sm:text-2xl font-medium">
        {t("allAdvertisements")}
      </h5>

      {/* Location Alert - shows when items are from different location */}
      {locationAlertMessage && AllItem.length > 0 && (
        <Alert variant="warning" className="mt-3">
          <InfoIcon />
          <AlertTitle>{locationAlertMessage}</AlertTitle>
          <AlertDescription className="sr-only"></AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6 mt-6">
        {AllItem && AllItem.length > 0 ? (
          AllItem?.map((item) => (
            <AdCard key={item?.id} item={item} handleLike={handleLikeAllData} />
          ))
        ) : (
          <div className="col-span-full">
            <NoData title={t("noAdvertisementFound")} />
          </div>
        )}
      </div>

      {AllItem && AllItem.length > 0 && hasMore && (
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
      <SectionBanners banners={belowBanners} className="mt-6 sm:mt-12" />
    </section>
  );
};

export default AllItems;
