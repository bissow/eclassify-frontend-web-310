'use client'
import { getReduxCurrentLangCode } from "@/store/slices/languageSlice";
import { formatDateMonthYear } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CalendarCheckIcon, HeartIcon } from "@phosphor-icons/react";
import { manageFavouriteApi } from "@/lib/api";
import { toast } from "sonner";
import { getIsLoggedIn } from "@/store/slices/authSlice";
import { useSelector } from "react-redux";
import { getCompanyName } from "@/store/slices/settingSlice";
import ShareDropdown from "@/components/common/ShareDropdown";
import { setIsLoginOpen } from "@/store/slices/globalStateSlice";
import { useParams } from "next/navigation";
import { useTranslation } from "@/lang/useTranslation";

const AdDetailCard = ({ productDetails, setProductDetails }) => {
  const { t } = useTranslation();
  const langCode = useSelector(getReduxCurrentLangCode);
  const { lang } = useParams();
  const currentUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${lang}/ad-details/${productDetails?.slug}`;
  const translation = productDetails?.translated_item;
  const isLoggedIn = useSelector(getIsLoggedIn);
  const CompanyName = useSelector(getCompanyName);
  const FbTitle =
    translation?.name + " | " + CompanyName;
  const headline = `🚀 Discover the perfect deal! Explore "${translation?.name}" from ${CompanyName} and grab it before it's gone. Shop now at`;

  const isJobCategory = Number(productDetails?.category?.is_job_category) === 1;
  const price = isJobCategory
    ? productDetails?.formatted_salary_range
    : productDetails?.formatted_price;

  const handleLikeItem = async () => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }
    try {
      const response = await manageFavouriteApi.manageFavouriteApi({
        item_id: productDetails?.id,
      });
      if (response?.data?.error === false) {
        setProductDetails((prev) => ({
          ...prev,
          is_liked: !productDetails?.is_liked,
        }));
      }
      toast.success(response?.data?.message);
    } catch (error) {
      console.log(error);
    }
  };

  const activePromo =
    productDetails?.active_promotion_item ||
    productDetails?.active_promotions?.sales?.[0];
  const promotionalPrice =
    activePromo?.formatted_promotional_price ||
    (activePromo?.promotional_price
      ? formatPriceAbbreviated(activePromo.promotional_price, t, settings)
      : null);

  return (
    <div className="flex flex-col gap-4 border p-4 rounded-lg">
      <div className="flex justify-between max-w-full">
        <div className="flex flex-col gap-2">
          <h1
            className="text-xl sm:text-2xl font-medium break-all line-clamp-2"
            title={translation?.name || productDetails?.name}
          >
            {translation?.name || productDetails?.name}
          </h1>

          {/* Promotion / Sale Badge */}
          {activePromo && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white bg-destructive shadow-xs">
                🔥 {activePromo.discount_type === "percentage" || activePromo.discount_percentage
                  ? `${activePromo.discount_percentage || activePromo.discount_value}% OFF`
                  : `SAVE ${activePromo.discount_value}`} - {t("specialOffer") || "SALE"}
              </span>
              {activePromo.remaining_stock_quantity <= 5 && activePromo.remaining_stock_quantity > 0 && (
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  ⚡ {t("onlyFewLeft") || `Only ${activePromo.remaining_stock_quantity} left in stock!`}
                </span>
              )}
            </div>
          )}

          <div className="flex items-baseline gap-3 flex-wrap">
            <h2
              className="text-2xl sm:text-3xl text-primary font-bold break-all text-balance line-clamp-2"
              title={price}
            >
              {promotionalPrice || price}
            </h2>
            {activePromo && (
              <span className="text-lg font-medium line-through text-muted-foreground">
                {price}
              </span>
            )}
          </div>
        </div>
        {/* Tablet & Desktop only: like + share buttons (vertical, beside title/price) */}
        <div className="hidden sm:flex flex-col gap-4">
          <button
            className="rounded-full size-8 sm:size-10 flex items-center justify-center border"
            onClick={handleLikeItem}
          >
            <HeartIcon
              className={cn("size-4 sm:size-5", productDetails?.is_liked && "text-primary")}
              weight={productDetails?.is_liked ? "fill" : "regular"}
            />
          </button>
          <ShareDropdown
            url={currentUrl}
            title={FbTitle}
            headline={headline}
            companyName={CompanyName}
            className="rounded-full size-8 sm:size-10 flex items-center justify-center border bg-white"
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-1 text-xs sm:text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <CalendarCheckIcon className="shrink-0 size-4" weight="bold" />
          <span>{t("postedOn")}: {formatDateMonthYear(productDetails?.created_at, langCode)}</span>
        </div>

        {/* Mobile only: like + share buttons (horizontal, beside date) */}
        <div className="flex gap-2 sm:hidden">
          <button
            className="rounded-full size-8 sm:size-10 flex items-center justify-center border"
            onClick={handleLikeItem}
          >
            <HeartIcon
              className={cn("size-4 sm:size-5", productDetails?.is_liked && "text-primary")}
              weight={productDetails?.is_liked ? "fill" : "regular"}
            />
          </button>
          <ShareDropdown
            url={currentUrl}
            title={FbTitle}
            headline={headline}
            companyName={CompanyName}
            className="rounded-full size-8 sm:size-10 flex items-center justify-center border bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default AdDetailCard;
