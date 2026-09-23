"use client";

import CustomImage from "@/components/common/CustomImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPinIcon,
  PhoneCallIcon,
  ChatCircleDotsIcon,
  GlobeIcon,
  ShieldCheckIcon,
  StarIcon,
  ShareNetworkIcon,
  StorefrontIcon,
} from "@phosphor-icons/react";
import ShareDropdown from "@/components/common/ShareDropdown";
import { useSelector } from "react-redux";
import { getIsLoggedIn } from "@/store/slices/authSlice";
import { setIsLoginOpen } from "@/store/slices/globalStateSlice";
import { useRouter } from "next/navigation";

export default function StoreHeroHeader({ store, totalItems = 0, currentUrl }) {
  const router = useRouter();
  const isLoggedIn = useSelector(getIsLoggedIn);

  if (!store) return null;

  const rating = Number(store.stats?.average_rating || 0).toFixed(1);
  const totalReviews = store.stats?.total_reviews || 0;
  const locationString = [store.address, store.city, store.state, store.country]
    .filter(Boolean)
    .join(", ");

  const handleChatClick = () => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }
    if (store.user_id) {
      router.push(`/chat?user_id=${store.user_id}`);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
      {/* Cover / Banner */}
      <div className="relative h-44 w-full bg-gradient-to-r from-primary/15 via-primary/5 to-muted sm:h-56">
        {store.banner_image ? (
          <CustomImage
            src={store.banner_image}
            alt={store.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5" />
        )}
      </div>

      {/* Profile Bar */}
      <div className="relative px-4 pb-6 pt-0 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {/* Avatar & Store Info */}
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <div className="-mt-14 relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-background bg-card shadow-md sm:h-28 sm:w-28">
              {store.logo_image || store.image ? (
                <CustomImage
                  src={store.logo_image || store.image}
                  alt={store.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                  <StorefrontIcon size={44} weight="duotone" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {store.name}
                </h1>
                {store.is_verified ? (
                  <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheckIcon size={14} weight="fill" />
                    Verified Store
                  </Badge>
                ) : null}
              </div>

              {locationString && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                  <MapPinIcon size={16} className="shrink-0 text-primary" weight="fill" />
                  <span className="line-clamp-1">{locationString}</span>
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                {Number(rating) > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    <StarIcon size={14} weight="fill" className="text-amber-500" />
                    {rating} ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                  </span>
                )}
                <span>•</span>
                <span className="font-medium text-foreground">
                  {totalItems} {totalItems === 1 ? "Item" : "Items"} in Catalog
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            {store.contact_number || store.phone ? (
              <Button asChild size="sm" className="gap-1.5">
                <a href={`tel:${store.contact_number || store.phone}`}>
                  <PhoneCallIcon size={16} weight="bold" />
                  <span>Call Store</span>
                </a>
              </Button>
            ) : null}

            {store.user_id && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleChatClick}
              >
                <ChatCircleDotsIcon size={16} weight="bold" />
                <span>Chat</span>
              </Button>
            )}

            {store.website_url && (
              <Button asChild variant="ghost" size="sm" className="gap-1.5">
                <a
                  href={store.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GlobeIcon size={16} weight="bold" />
                  <span className="hidden sm:inline">Website</span>
                </a>
              </Button>
            )}

            <ShareDropdown
              url={currentUrl || (typeof window !== "undefined" ? window.location.href : "")}
              title={store.name}
            />
          </div>
        </div>

        {store.description && (
          <p className="mt-4 border-t pt-4 text-sm leading-relaxed text-muted-foreground">
            {store.description}
          </p>
        )}
      </div>
    </div>
  );
}
