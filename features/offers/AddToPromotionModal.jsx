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
import { FireIcon, TagIcon, PercentIcon, ShieldWarningIcon, PackageIcon, InfoIcon } from "@phosphor-icons/react";
import { formatPriceAbbreviated } from "@/lib/format";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/slices/settingSlice";
import { extractArray } from "@/lib/utils";
import { useNavigate } from "@/hooks/useNavigate";

export default function AddToPromotionModal({ isOpen, setIsOpen, item, onSuccess }) {
  const { t } = useTranslation();
  const { navigate } = useNavigate();
  const settings = useSelector(settingsData);

  const [promotions, setPromotions] = useState([]);
  const [alreadySubmittedIds, setAlreadySubmittedIds] = useState([]);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [selectedPromoId, setSelectedPromoId] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [stockQuantity, setStockQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const originalPrice = parseFloat(item?.price || 0);

  useEffect(() => {
    if (!isOpen) return;
    const fetchPromos = async () => {
      try {
        setIsLoading(true);
        const res = await sellerPromotionsApi.getAvailablePromotions({ item_id: item?.id });
        setEligibilityData(res?.data?.data || null);
        const submitted = (res?.data?.data?.already_submitted_promotion_ids || []).map((id) => String(id));
        setAlreadySubmittedIds(submitted);
        const promoList = extractArray(res, "promotions");
        setPromotions(promoList);
        if (promoList.length > 0) {
          setSelectedPromoId(promoList[0].id);
          setDiscountType(promoList[0].discount_type || "percentage");
          setDiscountValue(promoList[0].discount || 15);
        }
      } catch (err) {
        console.error("Error loading open promotions:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPromos();
  }, [isOpen, item?.id]);

  const safePromotions = Array.isArray(promotions) ? promotions : [];
  const selectedPromotion = safePromotions.find((p) => String(p.id) === String(selectedPromoId));

  const calculatedPromoPrice = () => {
    const val = parseFloat(discountValue) || 0;
    if (discountType === "percentage") {
      const discountAmount = (originalPrice * val) / 100;
      return Math.max(0, originalPrice - discountAmount).toFixed(2);
    }
    return Math.max(0, originalPrice - val).toFixed(2);
  };

  const isAlreadySubmitted = alreadySubmittedIds.includes(String(selectedPromoId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPromoId) {
      toast.error(t("pleaseSelectPromotion") || "Please choose a promotion.");
      return;
    }
    if (parseFloat(discountValue) <= 0) {
      toast.error(t("invalidDiscount") || "Discount must be greater than 0.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await sellerPromotionsApi.addPromotionItem({
        promotion_id: selectedPromoId,
        item_id: item?.id,
        discount_type: discountType,
        discount_value: discountValue,
        stock_quantity: stockQuantity,
        replace: isAlreadySubmitted ? 1 : 0,
      });

      if (res?.data?.error === false) {
        toast.success(
          res?.data?.message ||
            (isAlreadySubmitted
              ? (t("promotionalOfferUpdated") || "Promotional offer updated successfully!")
              : (t("itemAddedToPromotion") || "Item submitted to promotion!"))
        );
        setIsOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res?.data?.message || t("failedToAddItem") || "Failed to submit item.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || t("failedToAddItem") || "Could not join promotion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FireIcon size={22} weight="fill" className="text-amber-500" />
              {t("joinPromotion") || "Submit Ad to Active Promotion / Sale"}
            </DialogTitle>
            <DialogDescription>
              {t("joinPromoSubtitle") || "Select an active offer zone event to feature your ad with a discounted sale price."}
            </DialogDescription>
          </DialogHeader>

          {/* Verification Warning Card */}
          {eligibilityData?.requires_verification && (
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex flex-col gap-3 my-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                  <ShieldWarningIcon size={24} weight="bold" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-foreground">
                    {eligibilityData?.verification_status === "pending" || eligibilityData?.verification_status === "resubmitted"
                      ? (t("verificationUnderReviewTitle") || "Verification Request Under Review")
                      : (t("verificationRequiredTitle") || "Seller Verification Required")}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {eligibilityData?.eligibility_msg || t("verificationRequiredDesc") || "Only verified seller accounts can participate in promotional sales. Please verify your account first."}
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
                {eligibilityData?.verification_status === "pending" || eligibilityData?.verification_status === "resubmitted"
                  ? (t("checkVerificationStatus") || "Check Verification Status")
                  : (t("verifyNow") || "Verify Account Now")}
              </Button>
            </div>
          )}

          {/* Subscription Package Required Warning Card */}
          {!eligibilityData?.requires_verification && eligibilityData?.requires_package && (
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
                    {eligibilityData?.eligibility_msg || t("packageRequiredDesc") || "You do not have active promotional package quota. Please subscribe to participate in sales events."}
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

          <div className="flex flex-col gap-4 py-4">
            {/* Promotion Selector */}
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">
                {t("selectPromotion") || "Active Promotion"}
              </label>
              {safePromotions.length > 0 ? (
                <select
                  value={selectedPromoId}
                  onChange={(e) => {
                    setSelectedPromoId(e.target.value);
                    const p = safePromotions.find((promo) => String(promo.id) === e.target.value);
                    if (p) {
                      setDiscountType(p.discount_type || "percentage");
                      setDiscountValue(p.discount || 15);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-border bg-card text-foreground focus:outline-hidden focus:border-primary"
                  required
                >
                  {safePromotions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.promotion_type?.replace(/_/g, " ").toUpperCase()})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                  {t("noActivePromotionsAvailable") || "There are no active promotions or sales open for seller submissions at this moment."}
                </div>
              )}

              {isAlreadySubmitted && (
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-2 text-xs text-foreground mt-2.5">
                  <InfoIcon size={18} weight="bold" className="text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    {t("adAlreadySubmittedNotice") ||
                      "This advertisement is already submitted to this promotion. You can update the promotional price and stock to replace the current offer."}
                  </span>
                </div>
              )}
            </div>

            {/* Price Preview Card */}
            <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground">{t("originalPrice") || "Original Price"}</span>
                <p className="text-base font-bold line-through text-muted-foreground">
                  {formatPriceAbbreviated(originalPrice, t, settings)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-primary font-bold">{t("promotionalPrice") || "New Sale Price"}</span>
                <p className="text-xl font-extrabold text-primary">
                  {formatPriceAbbreviated(calculatedPromoPrice(), t, settings)}
                </p>
              </div>
            </div>

            {/* Discount Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">
                  {t("discountType") || "Discount Type"}
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-border bg-card text-foreground focus:outline-hidden"
                >
                  <option value="percentage">{t("percentage") || "Percentage (%)"}</option>
                  <option value="flat">{t("flatAmount") || "Flat Amount"}</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">
                  {discountType === "percentage" ? `${t("discount") || "Discount"} (%)` : `${t("discountAmount") || "Discount"} (Fixed)`}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={discountType === "percentage" ? 99 : originalPrice - 1}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-border bg-card text-foreground focus:outline-hidden focus:border-primary"
                  required
                />
              </div>
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">
                {t("stockQuantityForSale") || "Quantity to Reserve on Sale"}
              </label>
              <input
                type="number"
                min="1"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-xl text-sm border border-border bg-card text-foreground focus:outline-hidden focus:border-primary"
                required
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                {t("stockSaleNote") || "Buyers will see remaining units ticking down as items are purchased."}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                safePromotions.length === 0 ||
                eligibilityData?.requires_verification ||
                (eligibilityData?.requires_package && !isAlreadySubmitted)
              }
            >
              {isSubmitting
                ? (t("submitting") || "Submitting...")
                : isAlreadySubmitted
                ? (t("replacePromotionOffer") || "Update / Replace Promotion")
                : (t("submitToSale") || "Submit to Sale")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
