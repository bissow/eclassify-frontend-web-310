"use client";
import { useEffect, useState } from "react";
import PurchasedPlanCard from "@/features/subscription/PurchasedPlanCard";
import { getUserPurchasedPackagesApi } from "@/lib/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useTranslation } from "@/lang/useTranslation";
import AddListingPlanCardSkeleton from "@/features/subscription/AddListingPlanCardSkeleton";
import { getIsRtl } from "@/store/slices/languageSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "@/hooks/useNavigate";
import NoData from "@/components/empty-states/NoData";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { PlusCircleIcon } from "@phosphor-icons/react";

const ProfileSubscription = () => {
  const { t } = useTranslation();
  const isRTL = useSelector(getIsRtl);
  const { navigate } = useNavigate();
  const [listingPackages, setListingPackages] = useState([]);
  const { lang: langCode } = useParams();
  const [adPackages, setAdPackages] = useState([]);
  const [isListingPackagesLoading, setIsListingPackagesLoading] =
    useState(false);
  const [isAdPackagesLoading, setIsAdPackagesLoading] = useState(false);

  useEffect(() => {
    handleFetchListingPackages();
    handleFetchFeaturedPackages();
  }, [langCode]);

  const handleFetchListingPackages = async () => {
    try {
      setIsListingPackagesLoading(true);
      const res = await getUserPurchasedPackagesApi.getUserPurchasedPackages({
        type: "item_listing"
      });
      setListingPackages(res?.data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsListingPackagesLoading(false);
    }
  };

  const handleFetchFeaturedPackages = async () => {
    try {
      setIsAdPackagesLoading(true);
      const res = await getUserPurchasedPackagesApi.getUserPurchasedPackages({
        type: "advertisement"
      });
      setAdPackages(res.data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsAdPackagesLoading(false);
    }
  };

  return (
    <>
      {isListingPackagesLoading ? (
        <AddListingPlanCardSkeleton />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-medium">{t("adListingPlan")}</h1>
              <Button className='px-3 py-1.5' onClick={() => navigate('/subscription?plan=listing')}>
                <PlusCircleIcon weight="bold" />
                {t('buyNewPlan')}
              </Button>
            </div>
            {
              listingPackages.length > 0 ?
                <div className="relative">
                  <Carousel
                    key={isRTL ? "rtl" : "ltr"}
                    opts={{
                      align: "start",
                      containScroll: "trim",
                      direction: isRTL ? "rtl" : "ltr",
                    }}
                    className="w-full"
                  >
                    <CarouselPrevious className="disabled:hidden flex absolute top-1/2 ltr:left-2 rtl:right-2 rtl:scale-x-[-1] -translate-y-1/2 bg-primary text-white rounded-full z-10" />
                    <CarouselNext className="disabled:hidden flex absolute top-1/2 ltr:right-2 rtl:left-2 rtl:scale-x-[-1] -translate-y-1/2 bg-primary text-white rounded-full z-10" />
                    <CarouselContent
                      className="sm:gap-4"
                    >
                      {listingPackages?.map((pckg) => (
                        <CarouselItem
                          key={pckg.id}
                          className="basis-[90%] sm:basis-[75%] md:basis-[50%] lg:basis-[66.66%] xl:basis-[50%] 2xl:basis-[45%]"
                        >
                          <PurchasedPlanCard
                            pckg={pckg}
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
                :
                <NoData title={t('noPurchasedPlanFound')} />
            }
          </div>
        </>
      )}
      {isAdPackagesLoading ? (
        <AddListingPlanCardSkeleton />
      ) : (
        <div
          className={`flex flex-col gap-4 ${listingPackages.length > 0 ? "mt-8" : ""
            }`}
        >
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-medium">{t("featuredAdPlan")}</h1>
            <Button className='px-3 py-1.5' onClick={() => navigate('/subscription?plan=featured')}>
              <PlusCircleIcon weight="bold" />
              {t('buyNewPlan')}
            </Button>
          </div>
          {
            adPackages?.length > 0 ?
              <div className="relative">
                <Carousel
                  key={isRTL ? "rtl" : "ltr"}
                  opts={{
                    align: "start",
                    containScroll: "trim",
                    direction: isRTL ? "rtl" : "ltr",
                  }}
                  className="w-full"
                >
                  <CarouselPrevious className="flex absolute top-1/2 ltr:left-2 rtl:right-2 rtl:scale-x-[-1] -translate-y-1/2 bg-primary text-white rounded-full z-10" />
                  <CarouselNext className="flex absolute top-1/2 ltr:right-2 rtl:left-2 rtl:scale-x-[-1] -translate-y-1/2 bg-primary text-white rounded-full z-10" />

                  <CarouselContent
                    className="sm:gap-4"
                  >
                    {adPackages?.map((pckg) => (
                      <CarouselItem
                        key={pckg.id}
                        className="basis-[90%] sm:basis-[75%] md:basis-[50%] lg:basis-[66.66%] xl:basis-[50%] 2xl:basis-[45%]"
                      >
                        <PurchasedPlanCard
                          pckg={pckg}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
              :
              <NoData title={t('noPurchasedPlanFound')} />
          }
        </div>
      )}
    </>
  );
};

export default ProfileSubscription;
