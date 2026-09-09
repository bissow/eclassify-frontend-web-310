"use client";
import { useState, useEffect } from "react";
import { sellerPromotionsApi } from "@/lib/api";
import { useTranslation } from "@/lang/useTranslation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowUpIcon, StarIcon, SparkleIcon, ShieldWarningIcon, PackageIcon, InfoIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useNavigate } from "@/hooks/useNavigate";

export default function PromoteAdModal({ isOpen, setIsOpen, itemId, onSuccess }) {
  const { t } = useTranslation();
  const { navigate } = useNavigate();
  const [options, setOptions] = useState(null);
  const [selectedType, setSelectedType] = useState("daily_bump_up");
  const [durationDays, setDurationDays] = useState(7);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !itemId) return;
    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        const res = await sellerPromotionsApi.getAdPromotionOptions({ item_id: itemId });
        setOptions(res?.data?.data);
      } catch (err) {
        console.error("Error fetching promotion options:", err);
        toast.error(t("failedToLoadOptions") || "Could not load promotion options.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOptions();
  }, [isOpen, itemId, t]);

  const handlePromote = async () => {
    try {
      setIsSubmitting(true);
      const res = await sellerPromotionsApi.promoteAd({
        item_id: itemId,
        promotion_type: selectedType,
        duration_days: durationDays,
      });

      if (res?.data?.error === false) {
        toast.success(res?.data?.message || t("adPromotedSuccessfully") || "Ad promoted successfully!");
        setIsOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res?.data?.message || t("promotionFailed") || "Promotion failed.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || t("promotionFailed") || "Failed to boost advertisement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activePromotions = options?.active_promotions || options?.options?.filter((o) => o.is_active).map((o) => o.type) || [];
  const isCurrentlyActiveSelected = activePromotions.includes(selectedType);

  const boostTypes = [
    {
      id: "daily_bump_up",
      title: t("dailyBumpUp") || "Daily Bump Up",
      description: t("dailyBumpDesc") || "Pushes your listing to the top of category & search results every 24 hours.",
      icon: ArrowUpIcon,
      available: options?.can_bump,
      remaining: options?.bump_remaining,
      isActive: activePromotions.includes("daily_bump_up"),
    },
    {
      id: "top_ad",
      title: t("topAd") || "Top Ad Placement",
      description: t("topAdDesc") || "Sticky highlighted placement with prominent badge above regular listings.",
      icon: StarIcon,
      available: options?.can_top_ad,
      remaining: options?.top_ad_remaining,
      isActive: activePromotions.includes("top_ad"),
    },
    {
      id: "spotlight",
      title: t("spotlightAd") || "Spotlight Hot Deal",
      description: t("spotlightDesc") || "Showcase on the Offer Zone top carousel and Home screen banner.",
      icon: SparkleIcon,
      available: options?.can_spotlight,
      remaining: options?.spotlight_remaining,
      isActive: activePromotions.includes("spotlight"),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <SparkleIcon size={22} weight="fill" className="text-primary" />
            {t("promoteYourAd") || "Promote & Boost this Ad"}
          </DialogTitle>
          <DialogDescription>
            {t("promoteAdSubtitle") || "Use your subscription package perks to get up to 10x more buyer views and inquiries."}
          </DialogDescription>
        </DialogHeader>

        {/* Verification Warning Card */}
        {options?.requires_verification && (
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex flex-col gap-3 my-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                <ShieldWarningIcon size={24} weight="bold" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-foreground">
                  {options?.verification_status === "pending" || options?.verification_status === "resubmitted"
                    ? (t("verificationUnderReviewTitle") || "Verification Request Under Review")
                    : (t("verificationRequiredTitle") || "Seller Verification Required")}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {options?.message || t("verificationRequiredDesc") || "Only verified seller accounts can promote listings. Please verify your account first."}
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate("/user-verification");
              }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs h-9"
            >
              {options?.verification_status === "pending" || options?.verification_status === "resubmitted"
                ? (t("checkVerificationStatus") || "Check Verification Status")
                : (t("verifyNow") || "Verify Account Now")}
            </Button>
          </div>
        )}

        {/* Subscription Package Required Warning Card */}
        {!options?.requires_verification && options?.requires_package && (
          <div className="p-4 rounded-2xl border border-primary/30 bg-primary/10 flex flex-col gap-3 my-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary/20 text-primary shrink-0">
                <PackageIcon size={24} weight="bold" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-foreground">
                  {t("packageRequiredTitle") || "Subscription Package Required"}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {options?.message || t("packageRequiredDesc") || "You need an active subscription package with promotional quota to use these features."}
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate("/user-subscription");
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-9"
            >
              {t("subscribePackage") || "View Subscription Packages"}
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-3 py-3">
          {boostTypes.map((boost) => {
            const Icon = boost.icon;
            const isSelected = selectedType === boost.id;
            const isAvailable = boost.available && !options?.requires_verification;

            return (
              <div
                key={boost.id}
                onClick={() => isAvailable && setSelectedType(boost.id)}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3",
                  isSelected ? "border-primary bg-primary/5 shadow-xs" : "border-border bg-card hover:border-border/80",
                  !isAvailable && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-xl shrink-0 mt-0.5",
                  isSelected ? "bg-primary text-white" : "bg-muted text-foreground"
                )}>
                  <Icon size={20} weight={isSelected ? "bold" : "regular"} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-foreground">{boost.title}</h4>
                      {boost.isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-bold">
                          {t("boostCurrentlyActive") || "Currently Active"}
                        </span>
                      )}
                    </div>
                    {isAvailable ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                        {boost.remaining} {t("creditsLeft") || "credits left"}
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                        {t("quotaExhausted") || "Package required"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{boost.description}</p>
                </div>
              </div>
            );
          })}

          {isCurrentlyActiveSelected && (
            <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/10 flex items-start gap-2 text-xs text-foreground mt-1">
              <InfoIcon size={18} weight="bold" className="text-primary shrink-0 mt-0.5" />
              <span>
                {t("boostActiveNotice") ||
                  "This boost is currently active on this advertisement. Promoting again will extend or replace the active boost duration."}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t("cancel") || "Cancel"}
          </Button>
          <Button
            onClick={handlePromote}
            disabled={
              isSubmitting ||
              !options ||
              options?.requires_verification ||
              options?.requires_package ||
              !boostTypes.find((b) => b.id === selectedType)?.available
            }
          >
            {isSubmitting
              ? (t("applying") || "Applying...")
              : isCurrentlyActiveSelected
              ? (t("extendOrReplaceBoost") || "Extend / Replace Boost")
              : (t("boostNow") || "Apply Boost Now")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
