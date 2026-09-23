"use client";
import { useTranslation } from "@/lang/useTranslation";
import CustomImage from "@/components/common/CustomImage";
import CustomLink from "@/components/common/CustomLink";
import { Badge } from "@/components/ui/badge";
import { MapPinIcon, ShieldCheckIcon, StarIcon, StorefrontIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useParams } from "next/navigation";

const StoreCard = ({ store }) => {
  const { t } = useTranslation();
  const { lang } = useParams();

  const storeUrl = `/${lang}/stores/${store?.slug || store?.id}`;
  const distanceFormatted = store?.distance?.formatted;
  const rating = Number(store?.stats?.average_rating || 0).toFixed(1);
  const totalReviews = store?.stats?.total_reviews || 0;
  const activeItems = store?.stats?.active_items_count || 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/50">
      {/* Cover Banner */}
      <div className="relative h-36 w-full overflow-hidden bg-muted">
        {store?.banner ? (
          <CustomImage
            src={store.banner}
            alt={store?.name || "Store Banner"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-primary/80 to-primary/40 flex items-center justify-center">
            <StorefrontIcon className="h-10 w-10 text-white/40" />
          </div>
        )}

        {/* Distance Badge */}
        {distanceFormatted && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <MapPinIcon weight="fill" className="h-3.5 w-3.5 text-primary" />
            {distanceFormatted}
          </span>
        )}
      </div>

      {/* Content Body */}
      <div className="relative flex flex-1 flex-col px-5 pb-5 pt-3">
        {/* Logo Avatar */}
        <div className="-mt-12 mb-3 inline-block self-start rounded-2xl border-4 border-card bg-card p-1 shadow-md">
          <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-muted">
            <CustomImage
              src={store?.logo || "/assets/images/default-profile.png"}
              alt={store?.name || "Store Logo"}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Store Title & Verification Badge */}
        <div className="flex items-center gap-1.5">
          <Link
            href={storeUrl}
            className="font-bold text-lg text-foreground line-clamp-1 transition-colors group-hover:text-primary"
          >
            {store?.name || t("store")}
          </Link>
          {store?.is_verified && (
            <ShieldCheckIcon weight="fill" className="h-5 w-5 shrink-0 text-blue-500" title="Verified Store" />
          )}
        </div>

        {/* Store Location */}
        <p className="mt-1 flex items-center text-xs text-muted-foreground line-clamp-1">
          <MapPinIcon className="mr-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span>{[store?.area?.name, store?.city, store?.state].filter(Boolean).join(", ") || t("onlineStore")}</span>
        </p>

        {/* Store Description Preview */}
        {store?.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
            {store.description}
          </p>
        )}

        {/* Footer Meta */}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-3 mt-4">
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
            <StarIcon weight="fill" className="h-4 w-4 text-amber-400" />
            <span>{rating}</span>
            <span className="text-muted-foreground font-normal">({totalReviews})</span>
          </div>

          <Badge variant="secondary" className="text-xs font-medium">
            {activeItems} {t("items")}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
