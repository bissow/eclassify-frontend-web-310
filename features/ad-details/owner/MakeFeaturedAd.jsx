import { useTranslation } from "@/lang/useTranslation";
import AdIconIllustration from "@/features/ad-details/owner/AdIconIllustration";
import { Button } from "@/components/ui/button";
import ReusableAlertDialog from "@/components/common/ReusableAlertDialog";
import { createFeaturedItemApi, getLimitsApi } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@/hooks/useNavigate";

import PromoteAdModal from "@/features/offers/PromoteAdModal";
import AddToPromotionModal from "@/features/offers/AddToPromotionModal";
import { SparkleIcon, FireIcon } from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import { userSignUpData } from "@/store/slices/authSlice";

const MakeFeaturedAd = ({ item_id, item, setProductDetails }) => {
  const { t } = useTranslation();
  const userData = useSelector(userSignUpData);
  const [isGettingLimits, setIsGettingLimits] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [isJoinPromoModalOpen, setIsJoinPromoModalOpen] = useState(false);
  const { navigate } = useNavigate();

  const handleCreateFeaturedAd = async () => {
    try {
      setIsGettingLimits(true);
      const res = await getLimitsApi.getLimits({
        package_type: "advertisement",
      });

      if (res?.data?.error === false) {
        // ✅ Limit granted → show confirmation modal
        setModalConfig({
          title: t("createFeaturedAd"),
          description: t("youWantToCreateFeaturedAd"),
          cancelText: t("cancel"),
          confirmText: t("yes"),
          onConfirm: createFeaturedAd,
        });
      } else {
        // ❌ No package → show subscribe modal
        setModalConfig({
          title: t("noPackage"),
          description: t("pleaseSubscribes"),
          cancelText: t("cancel"),
          confirmText: t("subscribe"),
          onConfirm: () => navigate("/user-subscription"),
        });
      }
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGettingLimits(false);
    }
  };

  const createFeaturedAd = async () => {
    try {
      setIsConfirmLoading(true);
      const res = await createFeaturedItemApi.createFeaturedItem({
        item_id,
        positions: "home_screen",
      });
      if (res?.data?.error === false) {
        toast.success(t("featuredAdCreated"));
        setProductDetails((prev) => ({
          ...prev,
          is_feature: true,
        }));
        setIsModalOpen(false);
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsConfirmLoading(false);
    }
  };

  return (
    <>
      <div className="border rounded-2xl p-5 flex flex-col gap-4 bg-card">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="bg-muted py-3 px-4 rounded-xl">
              <div className="w-12 h-14 relative">
                <AdIconIllustration className="absolute inset-0 w-full h-full" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-foreground text-center md:text-left">
                {t("boostAdVisibility") || "Boost & Promote Your Advertisement"}
              </h4>
              <p className="text-sm text-muted-foreground text-center md:text-left">
                {t("featureAdPrompt")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                if (userData && !userData.is_verified) {
                  setModalConfig({
                    title: t("verificationRequiredTitle") || "Seller Verification Required",
                    description: t("verificationRequiredDesc") || "Only verified seller accounts can promote listings and participate in sales. Please verify your account first.",
                    cancelText: t("cancel"),
                    confirmText: t("verifyNow") || "Verify Account Now",
                    onConfirm: () => navigate("/user-verification"),
                  });
                  setIsModalOpen(true);
                  return;
                }
                setIsPromoteModalOpen(true);
              }}
              variant="default"
              className="bg-primary flex items-center gap-1.5"
            >
              <SparkleIcon size={18} weight="fill" />
              <span>{t("promoteAd") || "Promote this Ad"}</span>
            </Button>

            <Button
              onClick={() => {
                if (userData && !userData.is_verified) {
                  setModalConfig({
                    title: t("verificationRequiredTitle") || "Seller Verification Required",
                    description: t("verificationRequiredDesc") || "Only verified seller accounts can promote listings and participate in sales. Please verify your account first.",
                    cancelText: t("cancel"),
                    confirmText: t("verifyNow") || "Verify Account Now",
                    onConfirm: () => navigate("/user-verification"),
                  });
                  setIsModalOpen(true);
                  return;
                }
                setIsJoinPromoModalOpen(true);
              }}
              variant="outline"
              className="border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 flex items-center gap-1.5"
            >
              <FireIcon size={18} weight="fill" className="text-amber-500" />
              <span>{t("joinSale") || "Join Sale / Flash Deal"}</span>
            </Button>

            <Button
              onClick={handleCreateFeaturedAd}
              disabled={isGettingLimits}
              variant="secondary"
            >
              {t("createFeaturedAd")}
            </Button>
          </div>
        </div>
      </div>

      <ReusableAlertDialog
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        description={modalConfig.description}
        cancelText={modalConfig.cancelText}
        confirmText={modalConfig.confirmText}
        confirmDisabled={isConfirmLoading}
      />

      <PromoteAdModal
        isOpen={isPromoteModalOpen}
        setIsOpen={setIsPromoteModalOpen}
        itemId={item_id}
      />

      <AddToPromotionModal
        isOpen={isJoinPromoModalOpen}
        setIsOpen={setIsJoinPromoModalOpen}
        item={item || { id: item_id }}
      />
    </>
  );
};

export default MakeFeaturedAd;

