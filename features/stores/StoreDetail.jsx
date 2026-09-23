"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lang/useTranslation";
import { storesApi, followUserApi } from "@/lib/api";
import CustomImage from "@/components/common/CustomImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClockIcon,
  EnvelopeIcon,
  GlobeIcon,
  MapPinIcon,
  PhoneCallIcon,
  ShieldCheckIcon,
  StarIcon,
  StorefrontIcon,
  ShareNetworkIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";
import ProductCard from "@/components/cards/ProductCard";
import ShareDropdown from "@/components/common/ShareDropdown";
import { useSelector } from "react-redux";
import { getIsLoggedIn } from "@/store/slices/authSlice";
import { setIsLoginOpen } from "@/store/slices/globalStateSlice";
import { toast } from "sonner";
import NoData from "@/components/empty-states/NoData";

const StoreDetail = ({ initialData, slug }) => {
  const { t } = useTranslation();
  const [storeData, setStoreData] = useState(initialData?.store || null);
  const [itemsData, setItemsData] = useState(initialData?.items?.data || []);
  const [reviewsData, setReviewsData] = useState(initialData?.reviews?.data || []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isFollowing, setIsFollowing] = useState(storeData?.is_following || false);
  const isLoggedIn = useSelector(getIsLoggedIn);

  const fetchDetail = async () => {
    try {
      setIsLoading(true);
      const res = await storesApi.getStoreDetail({ slug });
      if (res?.data?.error === false) {
        setStoreData(res?.data?.data?.store);
        setItemsData(res?.data?.data?.items?.data || []);
        setReviewsData(res?.data?.data?.reviews?.data || []);
        setIsFollowing(res?.data?.data?.store?.is_following || false);
      }
    } catch (error) {
      console.error("Error fetching store detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData && slug) {
      fetchDetail();
    }
  }, [slug]);

  const handleFollowToggle = async () => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }

    try {
      const res = await followUserApi.followUser({ user_id: storeData?.user_id });
      if (res?.data?.error === false) {
        setIsFollowing((prev) => !prev);
        toast.success(res?.data?.message || "Follow status updated");
      }
    } catch (error) {
      console.error("Follow error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <CircleNotchIcon className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="container mx-auto px-4 py-16">
        <NoData title={t("storeNotFound") || "Store Not Found"} description={t("storeNotFoundDesc") || "The requested store does not exist."} />
      </div>
    );
  }

  const rating = Number(storeData?.stats?.average_rating || 0).toFixed(1);
  const totalReviews = storeData?.stats?.total_reviews || 0;
  const activeItemsCount = storeData?.stats?.active_items_count || itemsData.length;

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Cover Banner */}
      <div className="relative h-56 w-full md:h-80 bg-muted overflow-hidden">
        {storeData?.banner ? (
          <CustomImage src={storeData.banner} alt={storeData.name} fill className="object-cover" priority />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
            <StorefrontIcon className="h-20 w-20 text-white/30" />
          </div>
        )}

        {/* Distance chip if available */}
        {storeData?.distance?.formatted && (
          <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md flex items-center gap-1.5">
            <MapPinIcon weight="fill" className="h-4 w-4 text-primary" />
            <span>{storeData.distance.formatted} {t("away") || "away"}</span>
          </div>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-16 mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* Logo & Main Info */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-card bg-muted shadow-md shrink-0">
                <CustomImage
                  src={storeData?.logo || "/assets/images/default-profile.png"}
                  alt={storeData.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{storeData.name}</h1>
                  {storeData.is_verified && (
                    <ShieldCheckIcon weight="fill" className="h-6 w-6 text-blue-500" title="Verified Store" />
                  )}
                </div>

                <p className="mt-1 flex items-center text-sm text-muted-foreground">
                  <MapPinIcon className="mr-1 h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{[storeData?.address, storeData?.city, storeData?.state].filter(Boolean).join(", ")}</span>
                </p>

                {/* Rating & Stats */}
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 font-semibold text-amber-500">
                    <StarIcon weight="fill" className="h-4 w-4 text-amber-400" />
                    <span>{rating}</span>
                    <span className="text-muted-foreground font-normal">({totalReviews} {t("reviews") || "reviews"})</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-medium text-foreground">{activeItemsCount} {t("activeAds") || "Active Ads"}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {storeData?.contact && (
                <Button asChild variant="outline" className="gap-2">
                  <a href={`tel:${storeData.country_code || ""}${storeData.contact}`}>
                    <PhoneCallIcon className="h-4 w-4 text-primary" />
                    {t("call") || "Call Store"}
                  </a>
                </Button>
              )}

              {storeData?.email && (
                <Button asChild variant="outline" className="gap-2">
                  <a href={`mailto:${storeData.email}`}>
                    <EnvelopeIcon className="h-4 w-4 text-primary" />
                    {t("email") || "Email"}
                  </a>
                </Button>
              )}

              <Button
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollowToggle}
                className="gap-2"
              >
                {isFollowing ? t("following") || "Following" : t("follow") || "Follow"}
              </Button>
            </div>
          </div>
        </div>

        {/* Store Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="products">{t("products") || "Products"} ({itemsData.length})</TabsTrigger>
            <TabsTrigger value="about">{t("aboutStore") || "About Store"}</TabsTrigger>
            <TabsTrigger value="reviews">{t("reviews") || "Reviews"} ({reviewsData.length})</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            {itemsData.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {itemsData.map((item) => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="py-12">
                <NoData title={t("noProducts") || "No Items Listed"} description={t("noProductsDesc") || "This store hasn't posted any active ads yet."} />
              </div>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:col-span-8">
                <h3 className="text-lg font-bold text-foreground mb-3">{t("aboutStore") || "About Store"}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {storeData.description || t("noDescriptionAvailable") || "No detailed description provided."}
                </p>

                {storeData.website && (
                  <div className="mt-6 flex items-center gap-2 text-sm">
                    <GlobeIcon className="h-4 w-4 text-primary shrink-0" />
                    <a href={storeData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {storeData.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Operating Hours Card */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:col-span-4">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-primary" />
                  {t("openingHours") || "Operating Hours"}
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-border">
                    <span className="text-muted-foreground">{t("timings") || "Timings"}</span>
                    <span className="font-semibold text-foreground">
                      {storeData.opening_time || "09:00 AM"} - {storeData.closing_time || "08:00 PM"}
                    </span>
                  </div>

                  {storeData.working_days && Array.isArray(storeData.working_days) && (
                    <div className="pt-2">
                      <span className="text-xs text-muted-foreground block mb-1.5">{t("workingDays") || "Working Days"}:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {storeData.working_days.map((day, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-6">{t("customerReviews") || "Customer Reviews"}</h3>

              {reviewsData.length > 0 ? (
                <div className="divide-y divide-border space-y-4">
                  {reviewsData.map((rev) => (
                    <div key={rev.id} className="pt-4 first:pt-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">{rev.buyer?.name || t("customer")}</span>
                        <div className="flex items-center text-amber-500 gap-1 text-xs">
                          <StarIcon weight="fill" className="h-3.5 w-3.5 text-amber-400" />
                          <span>{rev.ratings} / 5</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{rev.review}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("noReviewsYet") || "No reviews for this store yet."}</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StoreDetail;
