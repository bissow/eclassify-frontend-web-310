import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { itemOfferApi, sendMessageApi, tipsApi } from "@/lib/api";
import { useTranslation } from "@/lang/useTranslation";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckIcon } from "@phosphor-icons/react";
import { NumericFormat } from "react-number-format";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { userSignUpData } from "@/store/slices/authSlice";
import { getLastOfferSenderId } from "@/store/slices/chatSlice";

const MakeOfferModal = ({ isOpen, onClose, onSuccess, itemId, itemOfferId, price, currency, formattedPrice, mode = "create", initialAmount = "" }) => {
  const { t } = useTranslation();
  const displaySymbol = currency?.symbol;
  const displayPosition = currency?.symbol_position;
  const [offerAmount, setOfferAmount] = useState(initialAmount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tips, setTips] = useState([]);
  const [isLoadingTips, setIsLoadingTips] = useState(true);
  const [canProceed, setCanProceed] = useState(false);
  const userId = useSelector(userSignUpData)?.id;
  const lastOfferSenderId = useSelector(getLastOfferSenderId);
  const isOwnLastOffer = lastOfferSenderId != null && lastOfferSenderId === Number(userId);

  useEffect(() => {
    if (!isOpen) return;
    setOfferAmount(initialAmount);
    // Safety tips are for first-time offers only, not edits.
    if (mode === "edit") {
      setCanProceed(true);
      setIsLoadingTips(false);
    } else {
      setCanProceed(false);
      fetchTips();
    }
  }, [isOpen]);

  const fetchTips = async () => {
    try {
      setIsLoadingTips(true);
      const response = await tipsApi.tips();
      if (response?.data?.error === false) {
        const tipsData = response.data.data || [];
        setTips(tipsData);
        // If no tips found, automatically set canProceed to true
        if (!tipsData.length) {
          setCanProceed(true);
        }
      }
    } catch (error) {
      console.error("Error fetching tips:", error);
      // If error occurs, show make offer interface
      setCanProceed(true);
    } finally {
      setIsLoadingTips(false);
    }
  };

  const validateOffer = () => {
    if (!offerAmount.trim()) {
      setError(t("offerAmountRequired"));
      return false;
    }

    const amount = Number(offerAmount);
    const sellerPrice = Number(price);

    if (amount <= 0) {
      setError(t("offerAmountRequired"));
      return false;
    }

    if (amount >= sellerPrice) {
      setError(t("offerMustBeLessThanSellerPrice"));
      return false;
    }

    if (mode === "edit" && isOwnLastOffer && amount === Number(initialAmount)) {
      setError(t("offerAmountUnchanged"));
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateOffer()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response =
        mode === "edit"
          ? await sendMessageApi.sendMessage({
            item_offer_id: itemOfferId,
            amount: Number(offerAmount),
          })
          : await itemOfferApi.offer({
            item_id: itemId,
            amount: Number(offerAmount),
          });

      if (response?.data?.error === false) {
        toast.success(t("offerSentSuccessfully"));
        onClose();
        onSuccess?.(response?.data?.data, mode);
      } else {
        toast.error(t("unableToSendOffer"));
      }
    } catch (error) {
      toast.error(t("unableToSendOffer"));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (values) => {
    setOfferAmount(values.value);
    setError(""); // Clear error when user starts typing
  };

  const handleContinue = () => {
    setCanProceed(true);
  };

  const isUnchanged =
    mode === "edit" && isOwnLastOffer && String(offerAmount) === String(initialAmount);

  const renderMakeOfferForm = () => (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="text-4xl font-normal">
          {mode === "edit" ? t("edit") : t("makeAn")}
          <span className="text-primary">&nbsp;{t("offer")}</span>
        </DialogTitle>
        <DialogDescription>{t("openToOffers")}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2 bg-muted py-6 px-3 rounded-md justify-center items-center">
        <span>{t("originalPrice")}</span>
        <span className="text-2xl font-medium">
          {formattedPrice}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="space-y-2">
          <Label htmlFor="offerAmount" className="requiredInputLabel">
            {t("yourOffer")}
          </Label>
          <div className="relative">
            <span
              className={cn(
                "absolute top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none",
                displayPosition === "right" ? "right-3" : "left-3"
              )}
            >
              {displaySymbol}
            </span>
            <NumericFormat
              customInput={Input}
              id="offerAmount"
              inputMode="decimal"
              value={offerAmount ?? ""}
              thousandSeparator={currency?.thousand_separator || ","}
              decimalSeparator={currency?.decimal_separator || "."}
              allowNegative={false}
              onValueChange={handleChange}
              placeholder={t("typeOfferPrice")}
              className={cn(
                displayPosition === "right" ? "pr-8" : "pl-8",
                error ? "border-red-500 focus-visible:ring-red-500" : ""
              )}
            />
          </div>
          {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>
        <Button
          type="submit"
          className="py-2 px-4 rounded-md"
          disabled={isSubmitting || isUnchanged}
        >
          {isSubmitting ? t("sending") : mode === "edit" ? t("edit") : t("sendOffer")}
        </Button>
      </form>
    </div>
  );

  const renderTipsSection = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-4xl text-center font-normal">
          {t("safety")}
          <span className="text-primary">&nbsp;{t("tips")}</span>
        </DialogTitle>
      </DialogHeader>
      {isLoadingTips ? (
        <div className="space-y-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-[5%]" />
              <Skeleton className="h-4 w-[95%]" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {tips.map((tip) => (
            <div key={tip?.id} className="flex items-center gap-2">
              <div className="p-2 text-white bg-primary rounded-full">
                <CheckIcon size={18} weight="bold" />
              </div>
              <p className="">{tip?.translated_name}</p>
            </div>
          ))}
        </div>
      )}
      <Button onClick={handleContinue}>{t("continue")}</Button>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:py-[50px] sm:px-[90px]"
      >
        {!canProceed ? renderTipsSection() : renderMakeOfferForm()}
      </DialogContent>
    </Dialog>
  );
};

export default MakeOfferModal;
