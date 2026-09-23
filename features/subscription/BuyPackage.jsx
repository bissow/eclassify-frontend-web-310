"use client";
import { useEffect, useState } from "react";
import { assigFreePackageApi, getPackageApi, getPaymentSettingsApi } from "@/lib/api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useTranslation } from "@/lang/useTranslation";
import { getIsRtl } from "@/store/slices/languageSlice";
import { useSelector } from "react-redux";
import { getIsLoggedIn } from "@/store/slices/authSlice";
import { setIsLoginOpen } from "@/store/slices/globalStateSlice";
import { toast } from "sonner";
import BankDetailsModal from "@/features/subscription/BankDetailsModal";
import AdListingPublicPlanCardSkeleton from "@/features/subscription/AdListingPublicPlanCardSkeleton";
import { getIsFreAdListing } from "@/store/slices/settingSlice";
import { useNavigate } from "@/hooks/useNavigate";
import NoData from "@/components/empty-states/NoData";
import BuyPackageCard from "@/features/subscription/BuyPackageCard";
import PurchasedPlanCard from "@/features/subscription/PurchasedPlanCard";
import ReusableAlertDialog from "@/components/common/ReusableAlertDialog";
import { useParams } from "next/navigation";
import PaymentModal from "@/features/subscription/payment-modal/PaymentModal";

const BuyPackage = ({ categoryId, isFeaturedPlan, listingType }) => {
  const { t } = useTranslation();
  const isRTL = useSelector(getIsRtl);
  const { navigate } = useNavigate();
  const { lang: langCode } = useParams();

  const [listingPackages, setListingPackages] = useState([]);
  const hasListingDiscount = listingPackages?.some(
    (p) => p?.discount_in_percentage > 0
  );
  const [isListingPackagesLoading, setIsListingPackagesLoading] =
    useState(false);

  const [selectedPackage, setSelectedPackage] = useState(null);

  const [adPackages, setAdPackages] = useState([]);
  const hasAdDiscount = adPackages.some((p) => p.discount_in_percentage > 0);
  const [isAdPackagesLoading, setIsAdPackagesLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [packageSettings, setPackageSettings] = useState(null);
  const isLoggedIn = useSelector(getIsLoggedIn);
  const isFreeAdListing = useSelector(getIsFreAdListing);

  const [showFreeConfirmModal, setShowFreeConfirmModal] = useState(false);
  const [packageToAssign, setPackageToAssign] = useState(null);
  const [isAssigningPackage, setIsAssigningPackage] = useState(false);

  useEffect(() => {
    if (!isFreeAdListing && !isFeaturedPlan) {
      handleFetchListingPackages();
    }
    if (isFeaturedPlan) {
      handleFetchFeaturedPackages();
    }
  }, [langCode]);

  useEffect(() => {
    if (showPaymentModal) {
      handleFetchPaymentSetting();
    }
  }, [showPaymentModal]);

  const handleFetchPaymentSetting = async () => {
    setIsLoading(true);
    try {
      const res = await getPaymentSettingsApi.getPaymentSettings();
      const { data } = res.data;
      setPackageSettings(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchListingPackages = async () => {
    try {
      setIsListingPackagesLoading(true);
      const res = await getPackageApi.getPackage({
        type: "item_listing",
        ...(categoryId && { category_id: categoryId }),
        ...(listingType && { listing_type: listingType, is_renew: 1 }),
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
      const res = await getPackageApi.getPackage({ type: "advertisement" });
      setAdPackages(res.data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsAdPackagesLoading(false);
    }
  };

  const handlePurchasePackage = (pckg) => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }
    if (pckg?.final_price === 0) {
      if (pckg?.is_purchased_before) {
        toast.error(t("alreadyPurchasedFreePackage"));
        return;
      }
      // Instead of calling assignPackage(pckg.id) directly:
      setPackageToAssign(pckg.id); // Save the ID
      setShowFreeConfirmModal(true); // Show the alert dialog
    } else {
      setSelectedPackage(pckg);
      setShowPaymentModal(true);
    }
  };

  const assignPackage = async (id) => {
    try {
      setIsAssigningPackage(true);
      const res = await assigFreePackageApi.assignFreePackage({
        package_id: id,
      });
      const data = res?.data;
      if (data?.error === false) {
        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsAssigningPackage(false);
    }
  };

  const handleConfirmFreePackage = () => {
    if (packageToAssign) {
      assignPackage(packageToAssign);
    }
    setShowFreeConfirmModal(false);
  };

  return (
    <div className="container">
      {isListingPackagesLoading ? (
        <AdListingPublicPlanCardSkeleton />
      ) : (
        !isFreeAdListing && !isFeaturedPlan &&
        <div className="flex flex-col gap-4 mt-8">
          <h1 className="text-2xl font-medium">{t("adListingPlan")}</h1>
          {
            listingPackages?.length > 0 ?
              <div className="relative">
                <Carousel
                  key={isRTL ? "rtl" : "ltr"}
                  opts={{
                    align: "start",
                    containScroll: "trim",
                    direction: isRTL ? "rtl" : "ltr",
                  }}
                >
                  <CarouselPrevious className="hidden disabled:hidden md:flex absolute top-1/2 ltr:left-2 rtl:right-2 rtl:scale-x-[-1] -translate-y-1/2 bg-primary text-white rounded-full z-10" />
                  <CarouselNext className="hidden disabled:hidden md:flex absolute top-1/2 ltr:right-2 rtl:left-2 rtl:scale-x-[-1] -translate-y-1/2 bg-primary text-white rounded-full z-10" />
                  <CarouselContent
                    className={`sm:gap-4 ${hasListingDiscount ? "pt-6" : ""}`}
                  >
                    {listingPackages?.map((pckg) => (
                      <CarouselItem
                        key={pckg.id}
                        className="basis-[90%] sm:basis-[75%] md:basis-[55%] lg:basis-[45%] xl:basis-[35%] 2xl:basis-[30%]"
                      >
                        {pckg.user_purchased_packages?.length > 0 ? (
                          <PurchasedPlanCard pckg={pckg} />
                        ) : (
                          <BuyPackageCard
                            pckg={pckg}
                            handlePurchasePackage={handlePurchasePackage}
                          />
                        )}
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
              :
              <NoData title={t("noAdListingPlanFound")} />
          }
        </div>
      )}

      {
        isFeaturedPlan && (
          isAdPackagesLoading ? (
            <AdListingPublicPlanCardSkeleton />
          ) : (
            <div className="flex flex-col gap-4 mt-8">
              <h1 className="text-2xl font-medium">{t("featuredAdPlan")}</h1>
              {
                adPackages.length > 0 ?
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
                      <CarouselPrevious className="hidden disabled:hidden md:flex absolute top-1/2 ltr:left-2 rtl:right-2 rtl:scale-x-[-1] -translate-y-1/2 bg-primary text-white rounded-full z-10" />
                      <CarouselNext className="hidden disabled:hidden md:flex absolute top-1/2 ltr:right-2 rtl:left-2 rtl:scale-x-[-1] -translate-y-1/2 bg-primary text-white rounded-full z-10" />
                      <CarouselContent
                        className={`sm:gap-4 ${hasAdDiscount ? "pt-6" : ""}`}
                      >
                        {adPackages?.map((pckg) => (
                          <CarouselItem
                            key={pckg.id}
                            className="basis-[90%] sm:basis-[75%] md:basis-[55%] lg:basis-[45%] xl:basis-[35%] 2xl:basis-[30%]"
                          >
                            {pckg.user_purchased_packages?.length > 0 ? (
                              <PurchasedPlanCard pckg={pckg} />
                            ) : (
                              <BuyPackageCard
                                pckg={pckg}
                                handlePurchasePackage={handlePurchasePackage}
                              />
                            )}
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                  </div>
                  :
                  <NoData title={t('noFeaturedAdPlanfound')} />
              }
            </div>
          )
        )}

      <PaymentModal
        showPaymentModal={showPaymentModal}
        setShowPaymentModal={setShowPaymentModal}
        selectedPackage={selectedPackage}
        packageSettings={packageSettings}
        isLoading={isLoading}
      />
      <BankDetailsModal
        packageId={selectedPackage?.id}
        bankDetails={packageSettings?.bankTransfer}
      />
      <ReusableAlertDialog
        open={showFreeConfirmModal}
        title={t("confirm")}
        description={t("confirmFreePackage")}
        onCancel={() => setShowFreeConfirmModal(false)}
        onConfirm={handleConfirmFreePackage}
        confirmText={t("confirm")}
        cancelText={t("cancel")}
        confirmDisabled={isAssigningPackage}
      />
    </div>
  );
};

export default BuyPackage;