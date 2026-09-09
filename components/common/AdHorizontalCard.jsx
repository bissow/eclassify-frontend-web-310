'use client';
import { timeAgo } from "@/lib/format";
import { HeartIcon, SealCheckIcon } from "@phosphor-icons/react";
import { manageFavouriteApi } from "@/lib/api";
import { useSelector } from "react-redux";
import { getIsLoggedIn } from "@/store/slices/authSlice";
import { toast } from "sonner";
import CustomLink from "@/components/common/CustomLink";
import { setIsLoginOpen } from "@/store/slices/globalStateSlice";
import CustomImage from "./CustomImage";
import { useDebouncedToggle } from "@/hooks/useDebouncedToggle";
import { useTranslation, useLocale } from "@/lang/useTranslation";

const AdHorizontalCard = ({ item, handleLike }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const isLoggedIn = useSelector(getIsLoggedIn)

  const productLink =
    item?.is_my_listing
      ? `/my-listing/${item?.slug}`
      : `/ad-details/${item?.slug}`;

  const price = item?.formatted_price || item?.formatted_salary_range;
  const isHidePrice = !price;

  const activePromo =
    item?.active_promotion_item ||
    item?.active_promotions?.sales?.[0];
  const promotionalPrice =
    activePromo?.formatted_promotional_price ||
    (activePromo?.promotional_price
      ? `${item?.currency?.symbol || ""}${activePromo.promotional_price}`
      : null);

  const toggleLike = useDebouncedToggle();

  const handleLikeItem = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }
    toggleLike(
      item?.id,
      item?.is_liked,
      (liked) => handleLike(item?.id, liked),
      () => manageFavouriteApi.manageFavouriteApi({ item_id: item?.id }),
      () => toast.error(t("failedToLike"))
    );
  };

  return (
    <CustomLink
      href={productLink}
      className="border p-2 rounded-md flex gap-2 sm:gap-4 w-full relative"
    >
      <CustomImage
        src={item?.image}
        width={219}
        height={190}
        alt={item?.translation?.name || "Product"}
        className="w-25 sm:w-54.75 h-auto aspect-square sm:aspect-219/190 rounded object-cover"
      />
      <div className="flex flex-col gap-1 sm:gap-2 justify-between flex-1 relative min-w-0">
        <div className="flex items-center gap-1">
          {activePromo ? (
            <div className="flex items-center gap-1 rounded-tl-md py-0.5 px-1.5 bg-destructive text-white w-fit mb-1 shadow-xs">
              <p className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-tight">
                🔥 {activePromo.discount_type === "percentage" || activePromo.discount_percentage
                  ? `${activePromo.discount_percentage || activePromo.discount_value}% OFF`
                  : `SAVE ${activePromo.discount_value}`}
              </p>
            </div>
          ) : item?.is_feature ? (
            <div className="flex items-center gap-1 rounded-tl-md py-0.5 px-1 bg-primary w-fit mb-1">
              <SealCheckIcon size={16} color="white" weight="bold" />
              <p className="text-white text-xs sm:text-sm">{t("featured")}</p>
            </div>
          ) : item?.is_spotlight ? (
            <div className="flex items-center gap-1 rounded-tl-md py-0.5 px-1.5 bg-gradient-to-r from-amber-500 to-orange-500 w-fit mb-1">
              <p className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">★ {t("spotlight") || "Spotlight"}</p>
            </div>
          ) : item?.is_top_ad ? (
            <div className="flex items-center gap-1 rounded-tl-md py-0.5 px-1.5 bg-indigo-600 w-fit mb-1">
              <p className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">▲ {t("topAd") || "Top"}</p>
            </div>
          ) : null}
          <div
            onClick={handleLikeItem}
            className="ms-auto size-6 sm:size-9 bg-white rounded-full flex items-center justify-center text-primary"
          >
            <button>
              <HeartIcon className="size-4 sm:size-6" weight={item?.is_liked ? 'fill' : 'regular'} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:gap-2">
          {!isHidePrice && (
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-base sm:text-xl font-bold text-primary truncate" title={promotionalPrice || price}>
                {promotionalPrice || price}
              </p>
              {activePromo && (
                <span className="text-xs sm:text-sm line-through text-muted-foreground">
                  {price}
                </span>
              )}
            </div>
          )}

          <p
            className="text-base font-medium line-clamp-1"
            title={item?.translation?.name}
          >
            {item?.translation?.name}
          </p>

          <p className="text-xs sm:text-sm opacity-65 line-clamp-1">
            {item?.translation?.address}
          </p>
        </div>
        <div className="flex justify-end">
          <p className="text-xs sm:text-sm opacity-65 whitespace-nowrap" suppressHydrationWarning>
            {timeAgo(item?.published_at, locale, t)}&lrm;
          </p>
        </div>
      </div>
    </CustomLink>
  );
};

export default AdHorizontalCard;
