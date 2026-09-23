"use client";
import { useEffect, useState, useCallback } from "react";
import { offersApi } from "@/lib/api";
import { useTranslation } from "@/lang/useTranslation";
import CustomImage from "@/components/common/CustomImage";
import CustomLink from "@/components/common/CustomLink";
import OfferItemCard from "@/features/offers/OfferItemCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FireIcon,
  TagIcon,
  ClockCountdownIcon,
  SparkleIcon,
  MapPinIcon,
  SlidersHorizontalIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { useCountdown } from "@/hooks/useCountdown";
import { extractArray } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useSelector } from "react-redux";
import { getIsRtl } from "@/store/slices/languageSlice";

const LocationModal = dynamic(() => import("@/features/location/LocationModal.jsx"), {
  ssr: false,
});

function CampaignHeroBanner({ campaign }) {
  const countdown = useCountdown(campaign?.end_date);
  const { t } = useTranslation();

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-amber-600 text-white shadow-xl min-h-[220px]">
      <div className="absolute inset-0 opacity-20 mix-blend-overlay">
        {campaign?.banner_image && (
          <CustomImage
            src={campaign.banner_image}
            alt={campaign.title}
            fill
            className="object-cover"
          />
        )}
      </div>

      <div className="relative z-10 p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl text-center md:text-left">
          {campaign?.highlight_badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white mb-3">
              <SparkleIcon size={14} weight="fill" className="text-amber-300" />
              {campaign.highlight_badge}
            </span>
          )}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
            {campaign?.title}
          </h1>
          <p className="text-white/90 text-sm sm:text-base line-clamp-2 mb-4">
            {campaign?.description}
          </p>
          <CustomLink
            href={`/offers/campaign/${campaign?.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-primary font-bold hover:bg-white/90 transition-transform active:scale-95 shadow-md"
          >
            <span>{t("exploreCampaign") || "Explore Campaign"}</span>
            <ArrowRightIcon size={16} weight="bold" />
          </CustomLink>
        </div>

        {/* Live Countdown Clock for Campaign */}
        {!countdown.isExpired && campaign?.end_date && (
          <div className="flex flex-col items-center p-4 sm:p-6 rounded-2xl bg-black/35 backdrop-blur-md border border-white/20 text-center shrink-0">
            <span className="text-xs uppercase tracking-wider text-amber-300 font-bold mb-2">
              {t("campaignEndsIn") || "Campaign Ends In"}
            </span>
            <div className="flex items-center gap-2 text-white">
              <div className="flex flex-col items-center bg-white/10 px-3 py-2 rounded-xl min-w-14">
                <span className="text-2xl sm:text-3xl font-mono font-bold">{campaign.days ?? countdown.days}</span>
                <span className="text-[10px] uppercase text-white/70">{t("days") || "Days"}</span>
              </div>
              <span className="text-2xl font-bold">:</span>
              <div className="flex flex-col items-center bg-white/10 px-3 py-2 rounded-xl min-w-14">
                <span className="text-2xl sm:text-3xl font-mono font-bold">{String(countdown.hours).padStart(2, "0")}</span>
                <span className="text-[10px] uppercase text-white/70">{t("hours") || "Hrs"}</span>
              </div>
              <span className="text-2xl font-bold">:</span>
              <div className="flex flex-col items-center bg-white/10 px-3 py-2 rounded-xl min-w-14">
                <span className="text-2xl sm:text-3xl font-mono font-bold">{String(countdown.minutes).padStart(2, "0")}</span>
                <span className="text-[10px] uppercase text-white/70">{t("minutes") || "Min"}</span>
              </div>
              <span className="text-2xl font-bold">:</span>
              <div className="flex flex-col items-center bg-white/10 px-3 py-2 rounded-xl min-w-14">
                <span className="text-2xl sm:text-3xl font-mono font-bold">{String(countdown.seconds).padStart(2, "0")}</span>
                <span className="text-[10px] uppercase text-white/70">{t("seconds") || "Sec"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CampaignsCarousel({ campaigns = [] }) {
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);
  const isRTL = useSelector(getIsRtl);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (!campaigns || campaigns.length === 0) return null;

  if (campaigns.length === 1) {
    return <CampaignHeroBanner campaign={campaigns[0]} />;
  }

  return (
    <div className="relative w-full">
      <Carousel
        key={isRTL ? "rtl" : "ltr"}
        className="w-full"
        setApi={setApi}
        opts={{
          loop: true,
          direction: isRTL ? "rtl" : "ltr",
        }}
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
      >
        <CarouselContent>
          {campaigns.map((camp) => (
            <CarouselItem key={camp.id} className="basis-full">
              <CampaignHeroBanner campaign={camp} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Pagination dots for multiple campaigns */}
      <div className="flex justify-center items-center gap-2 mt-3">
        {campaigns.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => api?.scrollTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              current === idx
                ? "w-8 bg-primary shadow-xs"
                : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function OffersDirectory() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("all");
  const [campaigns, setCampaigns] = useState([]);
  const [items, setItems] = useState([]);
  const [spotlightAds, setSpotlightAds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Initial load
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [campRes, spotRes] = await Promise.all([
        offersApi.getCampaigns({ status: "active" }),
        offersApi.getSpotlightAds({ limit: 4 }),
      ]);

      setCampaigns(extractArray(campRes));
      setSpotlightAds(extractArray(spotRes));

      // Load items according to tab
      await fetchItemsByTab(activeTab);
    } catch (err) {
      console.error("Failed to load offers:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  const fetchItemsByTab = async (tab) => {
    try {
      let res;
      if (tab === "flash_sale") {
        res = await offersApi.getFlashSales();
      } else if (tab === "deal_of_the_day") {
        res = await offersApi.getDealsOfTheDay();
      } else if (tab === "clearance_sale") {
        res = await offersApi.getClearanceSales();
      } else {
        // all items
        res = await offersApi.getPromotionItems();
      }
      setItems(extractArray(res));
    } catch (err) {
      console.error("Failed to fetch promo items:", err);
      setItems([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTabChange = async (val) => {
    setActiveTab(val);
    setIsLoading(true);
    await fetchItemsByTab(val);
    setIsLoading(false);
  };

  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
  const safeSpotlight = Array.isArray(spotlightAds) ? spotlightAds : [];
  const safeItems = Array.isArray(items) ? items : [];

  const filteredItems = safeItems.filter((item) => {
    if (!searchQuery) return true;
    const name = item?.ad?.name || item?.item_name || item?.name || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="container py-8 flex flex-col gap-10">
      {/* Active Campaigns Carousel / Hero */}
      {safeCampaigns.length > 0 && (
        <CampaignsCarousel campaigns={safeCampaigns} />
      )}

      {/* Spotlight Highlights Section */}
      {safeSpotlight.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <SparkleIcon size={22} weight="fill" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-foreground">{t("spotlightDeals") || "Spotlight Hot Deals"}</h2>
                <p className="text-xs text-muted-foreground">{t("spotlightDesc") || "Top-tier curated offers selected for you"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {safeSpotlight.map((spot) => (
              <OfferItemCard key={spot.id} item={spot} promotionType="spotlight" />
            ))}
          </div>
        </section>
      )}

      {/* Main Promotions Tabs & Filter Bar */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-border pb-4">
          <div className="w-full md:w-auto">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-muted/60 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg py-2.5 px-4 text-xs sm:text-sm font-medium">
                  {t("allOffers") || "All Offers"}
                </TabsTrigger>
                <TabsTrigger value="flash_sale" className="rounded-lg py-2.5 px-4 text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  <FireIcon size={16} className="text-amber-500" weight="fill" />
                  <span>{t("flashSales") || "Flash Sales"}</span>
                </TabsTrigger>
                <TabsTrigger value="deal_of_the_day" className="rounded-lg py-2.5 px-4 text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  <ClockCountdownIcon size={16} className="text-primary" weight="bold" />
                  <span>{t("dealsOfTheDay") || "Daily Deals"}</span>
                </TabsTrigger>
                <TabsTrigger value="clearance_sale" className="rounded-lg py-2.5 px-4 text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  <TagIcon size={16} className="text-destructive" weight="bold" />
                  <span>{t("clearance") || "Clearance"}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search & Location Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <MagnifyingGlassIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchOffers") || "Search offers & items..."}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-card border border-border focus:outline-hidden focus:border-primary"
              />
            </div>

            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:border-primary text-sm font-medium text-foreground transition-colors shrink-0"
            >
              <MapPinIcon size={16} className="text-primary" weight="fill" />
              <span className="hidden sm:inline">{t("location") || "Location"}</span>
            </button>
          </div>
        </div>

        {/* Promotion Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 p-4 rounded-2xl border border-border bg-card">
                <Skeleton className="aspect-4/3 w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
                <Skeleton className="h-8 w-full rounded-xl mt-2" />
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <OfferItemCard
                key={item.id}
                item={item}
                promotionType={item?.promotion?.promotion_type || activeTab}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
            <div className="p-4 rounded-full bg-muted text-muted-foreground">
              <TagIcon size={36} />
            </div>
            <h3 className="text-lg font-bold text-foreground">{t("noOffersFound") || "No promotional offers found"}</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {t("noOffersDesc") || "There are no active discounts matching this filter right now. Check back soon or switch promotion tabs!"}
            </p>
          </div>
        )}
      </section>

      {/* Location Modal */}
      {isLocationModalOpen && (
        <LocationModal
          isOpen={isLocationModalOpen}
          setIsOpen={setIsLocationModalOpen}
        />
      )}
    </div>
  );
}
