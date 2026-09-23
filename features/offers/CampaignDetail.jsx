"use client";
import { useEffect, useState, use } from "react";
import { offersApi } from "@/lib/api";
import { useTranslation } from "@/lang/useTranslation";
import CustomImage from "@/components/common/CustomImage";
import OfferItemCard from "@/features/offers/OfferItemCard";
import { SparkleIcon, CalendarCheckIcon, TagIcon } from "@phosphor-icons/react";
import { useCountdown } from "@/hooks/useCountdown";
import { Skeleton } from "@/components/ui/skeleton";
import { extractArray } from "@/lib/utils";

export default function CampaignDetail({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug;
  const { t } = useTranslation();

  const [campaign, setCampaign] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const countdown = useCountdown(campaign?.end_date);

  useEffect(() => {
    if (!slug) return;
    const fetchCampaign = async () => {
      try {
        setIsLoading(true);
        const res = await offersApi.getCampaignDetail({ slug });
        const campData = res?.data?.data;
        setCampaign(campData);

        // Fetch items for this campaign
        if (campData?.id) {
          const itemsRes = await offersApi.getPromotionItems({ campaign_id: campData.id });
          setItems(extractArray(itemsRes));
        }
      } catch (err) {
        console.error("Failed to load campaign:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaign();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container py-10 flex flex-col gap-8">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-4/3 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground">{t("campaignNotFound") || "Campaign Not Found"}</h2>
      </div>
    );
  }

  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="container py-10 flex flex-col gap-10">
      {/* Campaign Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-amber-600 text-white p-8 sm:p-12 shadow-xl">
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

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl flex flex-col gap-3 text-center md:text-left">
            {campaign.highlight_badge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white w-fit mx-auto md:mx-0">
                <SparkleIcon size={14} weight="fill" className="text-amber-300" />
                {campaign.highlight_badge}
              </span>
            )}
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">{campaign.title}</h1>
            <p className="text-white/90 text-sm sm:text-base">{campaign.description}</p>

            <div className="flex items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-white/80 mt-2">
              <span className="flex items-center gap-1.5">
                <CalendarCheckIcon size={16} />
                {campaign.start_date?.substring(0, 10)} - {campaign.end_date?.substring(0, 10)}
              </span>
            </div>
          </div>

          {/* Prominent Campaign Ends In Countdown Box */}
          {!countdown.isExpired && campaign?.end_date && (
            <div className="flex flex-col items-center p-5 sm:p-6 rounded-2xl bg-black/35 backdrop-blur-md border border-white/20 text-center shrink-0 shadow-lg">
              <span className="text-xs uppercase tracking-wider text-amber-300 font-bold mb-3">
                {t("campaignEndsIn") || "Campaign Ends In"}
              </span>
              <div className="flex items-center gap-2 text-white">
                <div className="flex flex-col items-center bg-white/10 px-3.5 py-2.5 rounded-xl min-w-14">
                  <span className="text-2xl sm:text-3xl font-mono font-bold">{campaign.days ?? countdown.days}</span>
                  <span className="text-[10px] uppercase text-white/70">{t("days") || "Days"}</span>
                </div>
                <span className="text-2xl font-bold">:</span>
                <div className="flex flex-col items-center bg-white/10 px-3.5 py-2.5 rounded-xl min-w-14">
                  <span className="text-2xl sm:text-3xl font-mono font-bold">{String(countdown.hours).padStart(2, "0")}</span>
                  <span className="text-[10px] uppercase text-white/70">{t("hours") || "Hrs"}</span>
                </div>
                <span className="text-2xl font-bold">:</span>
                <div className="flex flex-col items-center bg-white/10 px-3.5 py-2.5 rounded-xl min-w-14">
                  <span className="text-2xl sm:text-3xl font-mono font-bold">{String(countdown.minutes).padStart(2, "0")}</span>
                  <span className="text-[10px] uppercase text-white/70">{t("minutes") || "Min"}</span>
                </div>
                <span className="text-2xl font-bold">:</span>
                <div className="flex flex-col items-center bg-white/10 px-3.5 py-2.5 rounded-xl min-w-14">
                  <span className="text-2xl sm:text-3xl font-mono font-bold">{String(countdown.seconds).padStart(2, "0")}</span>
                  <span className="text-[10px] uppercase text-white/70">{t("seconds") || "Sec"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Items Section */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {t("campaignOffers") || "Featured Deals in this Campaign"} ({safeItems.length})
          </h2>
        </div>

        {safeItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {safeItems.map((item) => (
              <OfferItemCard key={item.id} item={item} promotionType={item?.promotion?.promotion_type} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground flex flex-col items-center gap-2">
            <TagIcon size={40} />
            <p>{t("noCampaignItems") || "No items currently submitted to this campaign."}</p>
          </div>
        )}
      </section>
    </div>
  );
}
