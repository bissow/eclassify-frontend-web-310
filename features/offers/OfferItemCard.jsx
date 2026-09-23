"use client";
import CustomImage from "@/components/common/CustomImage";
import CustomLink from "@/components/common/CustomLink";
import { useCountdown } from "@/hooks/useCountdown";
import { formatPriceAbbreviated } from "@/lib/format";
import { useTranslation } from "@/lang/useTranslation";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/slices/settingSlice";
import { ClockCountdownIcon, FireIcon, LightningIcon, MapPinIcon, TagIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function OfferItemCard({ item, promotionType = "flash_sale" }) {
  const { t } = useTranslation();
  const settings = useSelector(settingsData);

  const countdown = useCountdown(item?.valid_until);

  const rawItem = item?.item || item?.ad || item;
  const originalPrice = parseFloat(item?.promotional_price ? (item?.original_price || rawItem?.price || 0) : (rawItem?.price || item?.original_price || 0));
  const promoPrice = parseFloat(item?.promotional_price || rawItem?.promotional_price || rawItem?.price || 0);
  const discountVal = item?.discount_value || rawItem?.discount_value;
  const isPercentage = (item?.discount_type || rawItem?.discount_type) === "percentage";

  const totalStock = parseInt(item?.stock_quantity || 0, 10);
  const remainingStock = parseInt(item?.remaining_stock_quantity || 0, 10);
  const claimedCount = Math.max(0, totalStock - remainingStock);
  const percentageClaimed = totalStock > 0 ? Math.min(100, Math.round((claimedCount / totalStock) * 100)) : 0;

  const itemSlug = rawItem?.slug || item?.item_slug || item?.slug || "";
  const itemName = rawItem?.name || item?.item_name || item?.translation?.name || item?.name || "Offer Item";
  const itemImage = rawItem?.image || item?.item_image || item?.image || "";
  const itemCity = rawItem?.city || item?.city || "";

  return (
    <div className="group relative rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Banner / Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        <CustomLink href={`/ad-details/${itemSlug}`} className="block w-full h-full">
          <CustomImage
            src={itemImage}
            alt={itemName}
            width={400}
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </CustomLink>

        {/* Discount Badge */}
        {discountVal > 0 && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white bg-destructive shadow-md animate-pulse">
              <LightningIcon size={14} weight="fill" />
              {isPercentage ? `-${discountVal}% OFF` : `-${formatPriceAbbreviated(discountVal, t, settings)}`}
            </span>
          </div>
        )}

        {/* Promotion Type Ribbon */}
        <div className="absolute top-2 right-2 z-10">
          <span className={cn(
            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm",
            promotionType === "flash_sale" ? "bg-amber-500/90 text-white" :
            promotionType === "clearance_sale" ? "bg-red-600/90 text-white" :
            promotionType === "deal_of_the_day" ? "bg-primary/90 text-white" :
            "bg-foreground/80 text-background"
          )}>
            {promotionType === "flash_sale" && <FireIcon size={12} weight="fill" />}
            {promotionType === "deal_of_the_day" && <ClockCountdownIcon size={12} weight="bold" />}
            {promotionType === "clearance_sale" && <TagIcon size={12} weight="bold" />}
            {promotionType === "flash_sale" ? (t("flashSale") || "Flash Sale") :
             promotionType === "clearance_sale" ? (t("clearanceSale") || "Clearance") :
             promotionType === "deal_of_the_day" ? (t("dealOfTheDay") || "Deal of Day") :
             (t("specialOffer") || "Special Offer")}
          </span>
        </div>

        {/* Live Countdown Overlay */}
        {!countdown.isExpired && item?.valid_until && (
          <div className="absolute bottom-2 inset-x-2 z-10">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/75 text-white backdrop-blur-md text-xs font-medium">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <ClockCountdownIcon size={14} weight="fill" />
                {t("endsIn") || "Ends in"}:
              </span>
              <span className="font-mono font-bold tracking-wider">
                {countdown.days > 0 ? `${countdown.days}d ` : ""}
                {String(countdown.hours).padStart(2, "0")}:
                {String(countdown.minutes).padStart(2, "0")}:
                {String(countdown.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <CustomLink href={`/ad-details/${itemSlug}`}>
            <h3 className="font-semibold text-base text-foreground line-clamp-2 hover:text-primary transition-colors" title={itemName}>
              {itemName}
            </h3>
          </CustomLink>

          {itemCity && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPinIcon size={14} className="shrink-0 text-primary" weight="fill" />
              <span>{itemCity}</span>
            </p>
          )}
        </div>

        {/* Price Row */}
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-extrabold text-primary">
              {formatPriceAbbreviated(promoPrice, t, settings)}
            </span>
            {originalPrice > promoPrice && (
              <span className="text-sm font-medium line-through text-muted-foreground">
                {formatPriceAbbreviated(originalPrice, t, settings)}
              </span>
            )}
          </div>

          {/* Stock Progress Bar */}
          {totalStock > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1 font-medium">
                <span>{claimedCount} {t("claimed") || "Claimed"}</span>
                <span className={remainingStock <= 3 ? "text-destructive font-bold animate-pulse" : ""}>
                  {remainingStock <= 3 ? `${remainingStock} ${t("leftOnly") || "left only!"}` : `${remainingStock} ${t("available") || "available"}`}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    remainingStock <= 3 ? "bg-destructive" : "bg-primary"
                  )}
                  style={{ width: `${percentageClaimed}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* View Deal Action */}
        <CustomLink
          href={`/ad-details/${itemSlug}`}
          className="mt-2 w-full py-2.5 px-4 rounded-xl text-center text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-xs"
        >
          {t("viewDeal") || "Grab This Deal"}
        </CustomLink>
      </div>
    </div>
  );
}
