import { useNavigate } from "@/hooks/useNavigate";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getIsFreAdListing } from "@/store/slices/settingSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lang/useTranslation";
import { renewItemApi, getUserPurchasedPackagesApi } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const RenewAd = ({
  setProductDetails,
  item_id,
  setStatus,
  categoryId,
  categoryName,
  isVideoAd = false,
}) => {
  const { t } = useTranslation();
  const { navigate } = useNavigate();
  const [RenewId, setRenewId] = useState("");
  const [ItemPackages, setItemPackages] = useState([]);
  const [isRenewingAd, setIsRenewingAd] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);

  const isFreeAdListing = useSelector(getIsFreAdListing);
  const { lang: langCode } = useParams();

  const isActivePackageAvailable = ItemPackages.length > 0;
  const globalPackages = ItemPackages.filter((item) => item?.is_global == 1);
  const categoryPackages = ItemPackages.filter((item) => item?.is_global != 1);


  useEffect(() => {
    if (isFreeAdListing) {
      setIsLoadingPackages(false);
      return;
    }
    getItemsPackageData();
  }, [langCode, isFreeAdListing]);

  const getItemsPackageData = async () => {
    try {
      setIsLoadingPackages(true);
      const res = await getUserPurchasedPackagesApi.getUserPurchasedPackages({
        type: "item_listing",
        category_id: categoryId,
        item_type: isVideoAd ? "reel" : "normal",
      });
      const { data } = res.data;
      setItemPackages(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const handleRenewItem = async () => {
    if (!isFreeAdListing && !RenewId) {
      toast.error(t("selectRenewalPackageError"));
      return;
    }
    try {
      setIsRenewingAd(true);
      const res = await renewItemApi.renewItem({
        item_id: item_id,
        ...(isFreeAdListing ? {} : { package_id: RenewId }),
      });
      if (res?.data?.error === false) {
        setProductDetails((prev) => ({
          ...prev,
          status: res?.data?.data?.status,
        }));
        setStatus(res?.data?.data?.status);
        toast.success(res?.data?.message);
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsRenewingAd(false);
    }
  };

  return (
    <div className="flex flex-col border rounded-md ">
      <div className="p-4 border-b font-semibold">{t("renewAd")}</div>
      <div className="p-4 flex flex-col gap-4 ">
        {
          !isFreeAdListing && (
            isLoadingPackages ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : isActivePackageAvailable ?
              <Select
                className="outline-hidden"
                value={RenewId}
                onValueChange={(value) => setRenewId(value)}
              >
                <SelectTrigger className="outline-hidden">
                  <SelectValue placeholder={t("selectRenewalPackage")} />
                </SelectTrigger>
                <SelectContent className="w-(--radix-select-trigger-width)">
                  {/* Global Packages */}
                  {globalPackages.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>{t("globalPackages")}</SelectLabel>
                      {globalPackages.map((item) => (
                        <SelectItem value={item?.id} key={item?.id}>
                          {item?.translated_name} - {item.listing_duration_days} {t("days")}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {/* Category Packages */}
                  {categoryPackages.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>{t("categoryPackages")}</SelectLabel>
                      {categoryPackages.map((item) => (
                        <SelectItem value={item?.id} key={item?.id}>
                          {item?.translated_name} - {item.listing_duration_days} {t("days")}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
              :
              <div className="flex flex-col gap-2">
                <h6 className="text-sm font-medium text-destructive">{t('subscriptionRequired')}</h6>
                <p className="text-sm text-muted-foreground">
                  {t('renewAdPackageRequiredPrefix')} {categoryName}{" "}
                  {isVideoAd ? t('renewVideoAdPackageRequiredSuffix') : t('renewAdPackageRequiredSuffix')}
                </p>
              </div>
          )
        }
        <button
          className="bg-primary text-white font-medium w-full p-2 rounded-md disabled:opacity-80"
          onClick={(isFreeAdListing || isActivePackageAvailable) ? handleRenewItem : () => navigate(`/subscription?plan=listing&category_id=${categoryId}&listing_type=${isVideoAd ? "reel" : "normal"}`)}
          disabled={isRenewingAd || isLoadingPackages}
        >
          {(isFreeAdListing || isActivePackageAvailable) ? t("renew") : t('purchase')}
        </button>
      </div>
    </div>
  );
};

export default RenewAd;
