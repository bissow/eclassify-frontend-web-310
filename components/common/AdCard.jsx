'use client';
import { timeAgo } from "@/lib/format";
import { manageFavouriteApi } from "@/lib/api";
import { useSelector } from "react-redux";
import { getIsLoggedIn } from "@/store/slices/authSlice";
import CustomLink from "@/components/common/CustomLink";
import { toast } from "sonner";
import { setIsLoginOpen } from "@/store/slices/globalStateSlice";
import CustomImage from "./CustomImage";
import { HeartIcon, SealCheckIcon } from "@phosphor-icons/react";
import { useDebouncedToggle } from "@/hooks/useDebouncedToggle";
import { useTranslation, useLocale } from "@/lang/useTranslation";

const AdCard = ({ item, handleLike }) => {
  const { t } = useTranslation();
  const isLoggedIn = useSelector(getIsLoggedIn)
  const locale = useLocale();
  const price = item?.formatted_price || item?.formatted_salary_range;
  const isHidePrice = !price;

  const productLink =
    item?.is_my_listing
      ? `/my-listing/${item?.slug}`
      : `/ad-details/${item?.slug}`;

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
      (liked) => handleLike(item?.id, liked), // parent just sets the flag, no toggling logic there
      () => manageFavouriteApi.manageFavouriteApi({ item_id: item?.id }),
      () => toast.error(t("failedToLike"))
    );
  };

  return (
    <CustomLink
      href={productLink}
      className="border p-2 rounded-2xl flex flex-col gap-2 h-full bg-white"
    >
      <div className="relative">
        <CustomImage
          src={item?.image}
          width={288}
          height={249}
          className="w-full aspect-square rounded object-cover"
          alt={item?.translation?.name || "Product"}
        />
        {item?.is_feature && (
          <div className="flex items-center gap-1 ltr:rounded-tl rtl:rounded-tr py-0.5 px-1 bg-primary absolute top-0 ltr:left-0 rtl:right-0">
            <SealCheckIcon size={16} color="white" weight="bold" />
            <p className="text-white text-xs sm:text-sm">{t("featured")}</p>
          </div>
        )}
        <div
          onClick={handleLikeItem}
          className="absolute size-6 sm:size-9 ltr:right-2 rtl:left-2 top-2 bg-white rounded-full flex items-center justify-center text-primary"
        >
          <button className="flex items-center justify-center">
            <HeartIcon className="size-4 sm:size-6" weight={item?.is_liked ? 'fill' : 'regular'} />
          </button>
        </div>
      </div>

      <div className="space-between gap-2">
        {isHidePrice ? (
          <p className="text-sm sm:text-base font-medium line-clamp-1">
            {item?.translation?.name}
          </p>
        ) : (
          <p
            className="text-sm sm:text-lg font-bold break-all text-balance line-clamp-2"
            title={price}
          >
            {price}
          </p>
        )}

        <p className="text-xs sm:text-sm opacity-65 whitespace-nowrap" suppressHydrationWarning>
          {timeAgo(item?.published_at, locale, t)}&lrm;
        </p>
      </div>

      {!isHidePrice && (
        <p className="text-sm sm:text-base font-medium line-clamp-1">
          {item?.translation?.name}
        </p>
      )}
      <p className="text-xs sm:text-sm opacity-65 line-clamp-1">
        {item?.translation?.address}
      </p>
    </CustomLink>
  );
};

export default AdCard;
