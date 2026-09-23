"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lang/useTranslation";
import { sellerPromotionsApi, getVerificationStatusApi } from "@/lib/api";
import CustomImage from "@/components/common/CustomImage";
import CustomLink from "@/components/common/CustomLink";
import { formatPriceAbbreviated } from "@/lib/format";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/slices/settingSlice";
import { userSignUpData } from "@/store/slices/authSlice";
import {
  FireIcon,
  SparkleIcon,
  ClockCountdownIcon,
  TagIcon,
  TrendUpIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  HourglassMediumIcon,
  ShoppingBagOpenIcon,
  ArrowsDownUpIcon,
  LightningIcon,
  RocketLaunchIcon,
  SealCheckIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function MyPromotions() {
  const { t } = useTranslation();
  const settings = useSelector(settingsData);
  const UserData = useSelector(userSignUpData);
  const isVerified = UserData?.is_verified === 1 || UserData?.is_verified === true;

  const [analytics, setAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const res = await sellerPromotionsApi.getPromotionsAnalytics();
      if (res?.data?.error === false) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load promotion analytics:", err);
    }
  };

  // Fetch history
  const fetchHistory = async (page = 1, filter = activeTab) => {
    try {
      setIsLoading(true);
      const res = await sellerPromotionsApi.getPromotionsHistory({
        page,
        filter_type: filter,
      });
      if (res?.data?.error === false) {
        setHistory(res.data.data.data || []);
        setCurrentPage(res.data.data.current_page || 1);
        setTotalPages(res.data.data.last_page || 1);
      }
    } catch (err) {
      console.error("Failed to load promotion history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVerified) {
      fetchAnalytics();
      fetchHistory(1, activeTab);
    }
  }, [activeTab, isVerified]);

  const [verificationStatus, setVerificationStatus] = useState("");

  useEffect(() => {
    if (!isVerified) {
      getVerificationStatusApi
        .getVerificationStatus()
        .then((res) => {
          if (res?.data?.data?.status) {
            setVerificationStatus(res.data.data.status);
          }
        })
        .catch(() => {});
    }
  }, [isVerified]);

  const isUnderReview =
    verificationStatus === "pending" ||
    verificationStatus === "resubmitted" ||
    verificationStatus === "submitted";

  if (!isVerified) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12 px-4 sm:px-6 max-w-2xl mx-auto">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            {isUnderReview ? (
              <HourglassMediumIcon size={44} weight="fill" className="text-amber-500 animate-pulse" />
            ) : (
              <ShieldCheckIcon size={44} weight="duotone" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-md">
            {isUnderReview ? (
              <ClockCountdownIcon size={18} weight="bold" />
            ) : (
              <SealCheckIcon size={18} weight="fill" />
            )}
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
          {isUnderReview ? <ClockCountdownIcon size={15} weight="bold" /> : <SealCheckIcon size={15} weight="fill" />}
          <span>
            {isUnderReview
              ? t("underReview") || "Under Review"
              : t("verifiedSellersOnly") || "Verified Sellers Only"}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
          {isUnderReview
            ? t("verificationUnderReviewTitle") || "Verification Request Under Review"
            : t("verificationRequiredForAnalyticsTitle") || "Seller Verification Required"}
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
          {isUnderReview
            ? t("verificationUnderReviewForAnalyticsDesc") ||
              "Your seller verification request is currently being reviewed by our moderation team. Once approved, your Promotions & Sales Analytics dashboard will automatically become active."
            : t("verificationRequiredForAnalyticsDesc") ||
              "The Promotions & Sales Analytics dashboard is exclusively available to verified sellers. Complete your seller verification to track live promotion performance, sales, discounts, and boost metrics."}
        </p>

        <div className="w-full bg-card border border-border rounded-2xl p-5 mb-8 text-left space-y-3 shadow-xs">
          <div className="flex items-start gap-3">
            <CheckCircleIcon size={20} weight="fill" className="text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-sm text-foreground">
              {t("verifyBenefitSales") || "Track live Flash Sales, Clearance Sales, and Deals of the Day performance"}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon size={20} weight="fill" className="text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-sm text-foreground">
              {t("verifyBenefitClaims") || "Monitor real-time units claimed and estimated promotional revenue"}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircleIcon size={20} weight="fill" className="text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-sm text-foreground">
              {t("verifyBenefitBoosts") || "Track Daily Bump Up, Top Ad, and Spotlight Carousel boost visibility"}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <CustomLink
            href="/user-verification"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition shadow-sm"
          >
            {isUnderReview ? <ClockCountdownIcon size={20} weight="bold" /> : <SealCheckIcon size={20} weight="bold" />}
            <span>
              {isUnderReview
                ? t("checkVerificationStatus") || "Check Verification Status"
                : t("verifyNow") || "Verify Account Now"}
            </span>
            <ArrowRightIcon size={16} weight="bold" />
          </CustomLink>

          <CustomLink
            href="/my-ads"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-medium hover:bg-accent transition"
          >
            <span>{t("backToMyAds") || "Back to My Ads"}</span>
          </CustomLink>
        </div>
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const breakdown = analytics?.breakdown_by_promotion_type || {};

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("promotionsPerformance") || "Promotions & Sales Analytics"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("promotionsPerformanceDesc") ||
            "Track real-time performance, items claimed, and revenue generated from sales and campaigns."}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Promoted Ads */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("activePromotedAds") || "Active Promotions"}
            </span>
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <FireIcon size={20} weight="fill" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-foreground">
              {summary.active_promoted_ads ?? 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span>{summary.active_sales_items ?? 0} {t("sales") || "sales"}</span>
              <span>•</span>
              <span>{summary.active_boosts ?? 0} {t("boosts") || "boosts"}</span>
            </div>
          </div>
        </div>

        {/* Total Units Sold / Claimed */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("unitsClaimedSold") || "Promo Units Sold"}
            </span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <TrendUpIcon size={20} weight="bold" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-foreground">
              {summary.total_units_sold ?? 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t("acrossAllSales") || "Across all promotional events"}
            </div>
          </div>
        </div>

        {/* Estimated Promo Revenue */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("promoSalesRevenue") || "Generated Revenue"}
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CurrencyDollarIcon size={20} weight="bold" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-foreground">
              {formatPriceAbbreviated(summary.total_promo_revenue || 0, t, settings)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t("viaPromoPurchases") || "Through discounted sales"}
            </div>
          </div>
        </div>

        {/* Campaigns Joined */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("campaignsJoined") || "Campaigns Joined"}
            </span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <SparkleIcon size={20} weight="fill" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-foreground">
              {summary.total_campaigns_joined ?? 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t("seasonalEvents") || "Seasonal marketing sales"}
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Types Quick Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Flash Sale Card */}
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <LightningIcon size={20} weight="fill" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">{t("flashSales") || "Flash Sales"}</div>
              <div className="text-xs text-muted-foreground">
                {breakdown.flash_sale?.units_claimed ?? 0} {t("unitsSold") || "units sold"}
              </div>
            </div>
          </div>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
            {formatPriceAbbreviated(breakdown.flash_sale?.revenue || 0, t, settings)}
          </span>
        </div>

        {/* Clearance Card */}
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400">
              <TagIcon size={20} weight="bold" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">{t("clearanceSales") || "Clearance Sales"}</div>
              <div className="text-xs text-muted-foreground">
                {breakdown.clearance_sale?.units_claimed ?? 0} {t("unitsSold") || "units sold"}
              </div>
            </div>
          </div>
          <span className="text-sm font-bold text-red-600 dark:text-red-400">
            {formatPriceAbbreviated(breakdown.clearance_sale?.revenue || 0, t, settings)}
          </span>
        </div>

        {/* Deals of the Day Card */}
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
              <ClockCountdownIcon size={20} weight="bold" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">{t("dealsOfTheDay") || "Deals of the Day"}</div>
              <div className="text-xs text-muted-foreground">
                {breakdown.deal_of_the_day?.units_claimed ?? 0} {t("unitsSold") || "units sold"}
              </div>
            </div>
          </div>
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {formatPriceAbbreviated(breakdown.deal_of_the_day?.revenue || 0, t, settings)}
          </span>
        </div>
      </div>

      {/* History & Active Listing Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="flex flex-wrap h-auto p-1 bg-muted/60 rounded-xl gap-1">
            <TabsTrigger value="all" className="text-xs">
              {t("all") || "All"}
            </TabsTrigger>
            <TabsTrigger value="sales" className="text-xs">
              {t("sales") || "Sales"}
            </TabsTrigger>
            <TabsTrigger value="boosts" className="text-xs">
              {t("boosts") || "Boosts"}
            </TabsTrigger>
            <TabsTrigger value="flash_sale" className="text-xs">
              {t("flashSale") || "Flash"}
            </TabsTrigger>
            <TabsTrigger value="clearance_sale" className="text-xs">
              {t("clearance") || "Clearance"}
            </TabsTrigger>
            <TabsTrigger value="deal_of_the_day" className="text-xs">
              {t("dailyDeals") || "Daily"}
            </TabsTrigger>
            <TabsTrigger value="daily_bump_up" className="text-xs">
              {t("dailyBump") || "Bump Up"}
            </TabsTrigger>
            <TabsTrigger value="top_ad" className="text-xs">
              {t("topAd") || "Top Ad"}
            </TabsTrigger>
            <TabsTrigger value="spotlight" className="text-xs">
              {t("spotlight") || "Spotlight"}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <span className="text-xs text-muted-foreground shrink-0">
          {history.length} {t("recordsFound") || "records found"}
        </span>
      </div>

      {/* Table / List View */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-muted text-muted-foreground">
            <ShoppingBagOpenIcon size={32} />
          </div>
          <h3 className="font-semibold text-foreground text-base">
            {t("noPromotionRecords") || "No promotional items recorded yet"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {t("noPromotionRecordsDesc") ||
              "When you submit listings to flash sales, clearances, daily deals, or boost them with bump-ups and top ads, their metrics will appear here."}
          </p>
          <CustomLink
            href="/my-ads"
            className="mt-2 text-xs font-bold py-2 px-4 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-xs"
          >
            {t("goToMyAds") || "Go to My Ads"}
          </CustomLink>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((record) => {
            const isBoost = record.record_type === "boost";

            return (
              <div
                key={record.id}
                className="p-4 rounded-2xl border border-border bg-card hover:shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Product Info & Thumb */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <CustomImage
                    src={record.item_image}
                    alt={record.item_name || "item"}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-muted"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          record.is_currently_active
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {record.is_currently_active ? (
                          <>
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {t("active") || "Active"}
                          </>
                        ) : (
                          record.status?.toUpperCase()
                        )}
                      </span>

                      {/* Promotion Type Tag */}
                      {isBoost ? (
                        <span className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                          record.promotion_type === 'daily_bump_up' && "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30",
                          record.promotion_type === 'top_ad' && "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
                          record.promotion_type === 'spotlight' && "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                        )}>
                          {record.promotion_type === 'daily_bump_up' && <RocketLaunchIcon size={12} weight="fill" />}
                          {record.promotion_type === 'top_ad' && <FireIcon size={12} weight="fill" />}
                          {record.promotion_type === 'spotlight' && <SparkleIcon size={12} weight="fill" />}
                          {record.type_title || record.promotion_type}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          <LightningIcon size={11} weight="fill" />
                          {record.promotion?.title || record.promotion?.promotion_type}
                        </span>
                      )}

                      {/* Campaign Pill if part of a campaign */}
                      {record.promotion?.campaign && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          {record.promotion.campaign.title}
                        </span>
                      )}
                    </div>

                    <CustomLink
                      href={`/ad-details/${record.item_slug}`}
                      className="font-bold text-sm text-foreground hover:text-primary transition-colors truncate block mt-1"
                    >
                      {record.item_name}
                    </CustomLink>

                    {isBoost ? (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{t("boostPlacement") || "Boost Placement"}</span>
                        {record.last_bumped_at && (
                          <span className="text-sky-600 dark:text-sky-400 font-medium">
                            {t("lastBumped") || "Last bumped"}: {new Date(record.last_bumped_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>
                          {t("promoPrice") || "Promo"}:{" "}
                          <strong className="text-primary font-bold">
                            {formatPriceAbbreviated(record.promotional_price, t, settings)}
                          </strong>
                        </span>
                        {record.original_price > record.promotional_price && (
                          <span className="line-through text-muted-foreground/70">
                            {formatPriceAbbreviated(record.original_price, t, settings)}
                          </span>
                        )}
                        {record.discount_percentage > 0 && (
                          <span className="text-destructive font-bold">-{record.discount_percentage}%</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-border">
                  {/* Duration Active */}
                  <div className="text-center md:text-right">
                    <div className="text-xs text-muted-foreground">{t("duration") || "Active"}</div>
                    <div className="text-sm font-bold text-foreground">
                      {record.days_active} {record.days_active === 1 ? t("day") || "day" : t("days") || "days"}
                    </div>
                  </div>

                  {isBoost ? (
                    /* Boost Item: Views/Clicks instead of stock units */
                    <div className="text-center md:text-right min-w-20">
                      <div className="text-xs text-muted-foreground">{t("views") || "Views"}</div>
                      <div className="text-sm font-bold text-foreground">
                        {record.views || 0}
                      </div>
                    </div>
                  ) : (
                    /* Sale Item: Units Claimed / Sold */
                    <div className="text-center md:text-right min-w-20">
                      <div className="text-xs text-muted-foreground">{t("unitsSold") || "Units Sold"}</div>
                      <div className="text-sm font-bold text-foreground">
                        {record.claimed_units} / {record.stock_quantity}
                      </div>
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden mt-1 mx-auto md:ml-auto md:mr-0">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${record.claimed_percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Generated Revenue / Status */}
                  <div className="text-right min-w-24">
                    <div className="text-xs text-muted-foreground">
                      {isBoost ? (t("placement") || "Placement") : (t("revenue") || "Revenue")}
                    </div>
                    {isBoost ? (
                      <div className="text-sm font-bold text-primary">
                        {record.status?.toUpperCase()}
                      </div>
                    ) : (
                      <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatPriceAbbreviated(record.generated_revenue, t, settings)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}