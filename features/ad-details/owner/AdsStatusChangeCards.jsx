import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chanegItemStatusApi } from "@/lib/api";
import { toast } from "sonner";
import SoldOutModal from "@/features/ad-details/owner/SoldOutModal";
import ReusableAlertDialog from "@/components/common/ReusableAlertDialog";
import { useTranslation } from "@/lang/useTranslation";
import { useNavigate } from "@/hooks/useNavigate";
import { cn } from "@/lib/utils";

const AdsStatusChangeCards = ({
  productDetails,
  setProductDetails,
  status,
  setStatus,
}) => {
  const { t } = useTranslation();
  const { navigate } = useNavigate();
  const [IsChangingStatus, setIsChangingStatus] = useState(false);
  const [showSoldOut, setShowSoldOut] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRadioValue, setSelectedRadioValue] = useState(null);

  const isJobAd = productDetails?.category?.is_job_category === 1;

  const isResubmitted = productDetails?.status === "resubmitted";

  const isSoftRejected =
    productDetails?.status === "soft rejected" || isResubmitted;

  const isPermanentRejected = productDetails?.status === "permanent rejected";

  const IsDisableSelect = !(
    productDetails?.status === "approved" ||
    productDetails?.status === "inactive"
  );

  const isShowRejectedReason =
    productDetails?.rejected_reason &&
    (productDetails?.status === "soft rejected" ||
      productDetails?.status === "permanent rejected");
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  const updateItemStatus = async () => {
    if (productDetails?.status === status) {
      toast.error(t("changeStatusToSave"));
      return;
    }
    if (status === "sold out") {
      setShowSoldOut(true);
      return;
    }
    try {
      setIsChangingStatus(true);
      const res = await chanegItemStatusApi.changeItemStatus({
        item_id: productDetails?.id,
        status: status === "approved" ? "active" : status,
      });
      if (res?.data?.error === false) {
        setProductDetails((prev) => ({ ...prev, status }));
        toast.success(t("statusUpdated"));
        navigate("/my-ads");
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const makeItemSoldOut = async () => {
    try {
      setIsChangingStatus(true);
      const res = await chanegItemStatusApi.changeItemStatus({
        item_id: productDetails?.id,
        status: "sold out",
        sold_to: selectedRadioValue,
      });
      if (res?.data?.error === false) {
        toast.success(t("statusUpdated"));
        setProductDetails((prev) => ({ ...prev, status: "sold out" }));
        setShowConfirmModal(false);
      } else {
        toast.error(t("failedToUpdateStatus"));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <>
      {isSoftRejected ? (
        <div className="flex flex-col border rounded-md">
          <div
            className={cn(
              "p-4 text-xl font-medium",
              !isResubmitted && productDetails?.rejected_reason && "border-b"
            )}
          >
            {isResubmitted
              ? t("adResubmittedUnderReview")
              : t("adWasRejectedResubmitNow")}
          </div>
          {!isResubmitted && productDetails?.rejected_reason && (
            <div className="p-4">
              <p className="bg-red-100 text-[#dc3545] px-3 py-2 rounded text-sm font-medium">
                <span className="font-semibold">{t("rejectedReason")}:</span>{" "}
                {productDetails?.rejected_reason}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col border rounded-md">
          <div className="p-4 border-b font-semibold">{t("changeStatus")}</div>
          <div className="p-4 flex flex-col gap-4">
            <Select
              value={status}
              onValueChange={handleStatusChange}
              disabled={IsChangingStatus || IsDisableSelect}
            >
              <SelectTrigger className="outline-hidden">
                <SelectValue placeholder={t("status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">{t("active")}</SelectItem>
                <SelectItem value="inactive">{t("deactivate")}</SelectItem>
                <SelectItem value="review" disabled>
                  {t("review")}
                </SelectItem>
                <SelectItem value="permanent rejected" disabled>
                  {t("permanentRejected")}
                </SelectItem>
                <SelectItem value="expired" disabled>
                  {t("expired")}
                </SelectItem>
                <SelectItem
                  value="sold out"
                  disabled={productDetails?.status === "inactive"}
                >
                  {isJobAd ? t("jobClosed") : t("soldOut")}
                </SelectItem>
              </SelectContent>
            </Select>

            {isShowRejectedReason && (
              <p className="bg-red-100 text-[#dc3545] px-2 py-1 rounded text-sm mt-1.75 font-medium">
                <span className="font-medium">{t("rejectedReason")}:</span>{" "}
                {productDetails?.rejected_reason}
              </p>
            )}
            {!isPermanentRejected && (
              <button
                className="bg-primary text-white font-medium w-full p-2 rounded-md disabled:opacity-80"
                onClick={updateItemStatus}
                disabled={IsChangingStatus || IsDisableSelect}
              >
                {t("save")}
              </button>
            )}
          </div>
        </div>
      )}
      <SoldOutModal
        productDetails={productDetails}
        showSoldOut={showSoldOut}
        setShowSoldOut={setShowSoldOut}
        selectedRadioValue={selectedRadioValue}
        setSelectedRadioValue={setSelectedRadioValue}
        setShowConfirmModal={setShowConfirmModal}
      />

      <ReusableAlertDialog
        open={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={makeItemSoldOut}
        title={isJobAd ? t("confirmHire") : t("confirmSoldOut")}
        description={
          isJobAd ? t("markAsClosedDescription") : t("cantUndoChanges")
        }
        cancelText={t("cancel")}
        confirmText={t("confirm")}
        confirmDisabled={IsChangingStatus}
      />
    </>
  );
};

export default AdsStatusChangeCards;
