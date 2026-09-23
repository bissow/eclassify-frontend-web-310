import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "@/lang/useTranslation";
import { useNavigate } from "@/hooks/useNavigate";
import { cn } from "@/lib/utils";
import { useRazorpay } from "react-razorpay";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { createPaymentIntentApi, failPaymentTransactionApi, getReferPointsBalanceApi } from "@/lib/api";
import { getReferralSettings } from "@/store/slices/settingSlice";
import { showBankDetails } from "@/store/slices/globalStateSlice";
import SelectedPlan from "@/features/subscription/payment-modal/SelectedPlan";
import LoyaltyPoints from "@/features/subscription/payment-modal/LoyaltyPoints";
import PaymentMethods from "@/features/subscription/payment-modal/PaymentMethods";
import PaymentSummary from "@/features/subscription/payment-modal/PaymentSummary";
import StripePayment from "@/features/subscription/payment-modal/StripePayment";
import { GATEWAY_CONFIGS, PAYMENT_METHODS } from "@/features/subscription/lib/paymentConstants";
import { userSignUpData } from "@/store/slices/authSlice";

const isPaymentMethodActive = (packageSettings, key) => Number(packageSettings?.[key]?.status) === 1;

const PaymentModal = ({ showPaymentModal, setShowPaymentModal, selectedPackage, packageSettings, isLoading }) => {
    const { t } = useTranslation();
    const { Razorpay } = useRazorpay();
    const { data: settingsData } = useSelector((state) => state.Settings);
    const userData = useSelector(userSignUpData);
    const { refer_earn_enabled, refer_max_points_to_use, refer_max_points_usage_percentage, refer_min_points_to_use } = useSelector(getReferralSettings);
    const { navigate } = useNavigate();

    const [isPaying, setIsPaying] = useState(false);
    const [referPoints, setReferPoints] = useState("");
    const [isLoadingReferPointsBalance, setIsLoadingReferPointsBalance] = useState(true);
    const [showStripePayment, setShowStripePayment] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
    const [appliedPoints, setAppliedPoints] = useState(0);
    const [pendingTransactionId, setPendingTransactionId] = useState(null);

    const isBankTransferActive = Number(packageSettings?.bankTransfer?.status) === 1;
    const activePaymentMethods = PAYMENT_METHODS.filter((method) => isPaymentMethodActive(packageSettings, method.settingsKey));

    const totalActiveMethods = activePaymentMethods.length + (isBankTransferActive ? 1 : 0);
    const autoSelectedMethod = totalActiveMethods === 1 ? (activePaymentMethods[0]?.id ?? "bank_transfer") : "";
    const effectiveSelectedMethod = selectedPaymentMethod || autoSelectedMethod;

    useEffect(() => {
        if (showPaymentModal && refer_earn_enabled) getReferPointsBalance();
    }, [showPaymentModal, refer_earn_enabled]);

    const getReferPointsBalance = async () => {
        try {
            setIsLoadingReferPointsBalance(true);
            const res = await getReferPointsBalanceApi.getReferPointsBalance();
            if (res?.data?.error === false) {
                setReferPoints(Number(res?.data?.data?.refer_points));
            } else {
                toast.error(res?.data?.message);
            }
        } catch (error) {
            console.log("error", error);
        } finally {
            setIsLoadingReferPointsBalance(false);
        }
    };

    const reportTransactionFailed = async (transactionId) => {
        if (!transactionId) return;
        try {
            await failPaymentTransactionApi.failTransaction({ payment_transaction_id: transactionId });
        } catch (error) {
            console.error("Error reporting failed transaction:", error);
        }
    };

    const closeModalUI = () => {
        setShowPaymentModal(false);
        setShowStripePayment(false);
    };

    const PaymentModalClose = () => {
        reportTransactionFailed(pendingTransactionId);
        setPendingTransactionId(null);
        closeModalUI();
    };

    const handleMessage = (event) => {
        if (event.origin === process.env.NEXT_PUBLIC_API_URL) {
            const { status } = event.data;
            if (status === "success") { toast.success(t("paymentSuccess")); navigate("/"); }
            else if (status === "cancel") { toast.error(t("paymentCancelled")); reportTransactionFailed(pendingTransactionId); }
            else { toast.error(t("paymentFailed")); reportTransactionFailed(pendingTransactionId); }
            setPendingTransactionId(null);
            closeModalUI();
        }
    };

    useEffect(() => {
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [handleMessage]);

    const handleApplyPoints = () => {
        if (!refer_earn_enabled || isLoadingReferPointsBalance) return;

        if (appliedPoints > 0) { setAppliedPoints(0); return; }

        if (!referPoints || referPoints <= 0) { toast.error(t("noPointsAvailable")); return; }

        if (referPoints < refer_min_points_to_use) { toast.error(`Minimum ${refer_min_points_to_use} points required`); return; }

        const percentageCap = (selectedPackage?.final_price * refer_max_points_usage_percentage) / 100;
        const pointsToApply = Math.min(referPoints, refer_max_points_to_use, percentageCap, selectedPackage?.final_price);

        setAppliedPoints(pointsToApply);
        toast.success(`${pointsToApply} ${t("pointsAppliedSuccessfully")}`);
    };


    const handlePayment = async (methodId) => {
        if (!methodId) { toast.error(t("pleaseSelectPaymentMethod")); return; }
        if (methodId === "bank_transfer") { setShowPaymentModal(false); showBankDetails(); return; }
        if (methodId === "stripe") { setShowStripePayment(true); return; }

        try {
            const config = GATEWAY_CONFIGS[methodId];
            if (!config) throw new Error("Unsupported payment method");
            if ((methodId === "phonepe" || methodId === "cashfree") && !userData?.mobile) { toast.error(t("addMobileNumberToProceed")); return; }

            setIsPaying(true);
            const res = await createPaymentIntentApi.createIntent({
                package_id: selectedPackage.id,
                payment_method: config.intentMethod,
                platform_type: "web",
            });

            if (res.data.error) { toast.error(res.data.message); return; }

            const paymentIntent = res.data.data.payment_intent;
            const transactionId = res.data.data.payment_transaction?.id;
            setPendingTransactionId(transactionId);

            if (methodId === "razorpay") {
                setShowPaymentModal(false);
                const options = {
                    key: packageSettings.Razorpay.api_key,
                    name: settingsData.company_name,
                    description: settingsData.company_name,
                    image: settingsData.company_logo,
                    order_id: paymentIntent.id,
                    handler: () => { setPendingTransactionId(null); toast.success(t("paymentSuccess")); navigate("/"); setShowPaymentModal(false); },
                    prefill: { name: userData?.name, email: userData?.email, contact: userData?.mobile },
                    theme: { color: settingsData.web_theme_color },
                    modal: { ondismiss: () => { reportTransactionFailed(transactionId); setPendingTransactionId(null); } },
                };
                const rzpay = new Razorpay(options);
                rzpay.open();
            } else {
                const authUrl = config.urlPath.split(".").reduce((obj, key) => obj?.[key], paymentIntent);
                if (authUrl) {
                    const width = 600, height = 700;
                    const left = window.innerWidth / 2 - width / 2;
                    const top = window.innerHeight / 2 - height / 2;
                    window.open(authUrl, "paymentWindow", `width=${width},height=${height},top=${top},left=${left}`);
                } else {
                    toast.error(t("unableToGetAuthUrl"));
                }
            }
        } catch (error) {
            console.error(`Error during ${methodId} payment:`, error);
            toast.error(t("errorOccurred"));
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <Dialog open={showPaymentModal} onOpenChange={PaymentModalClose}>
            <DialogContent
                className={cn(showStripePayment ? "max-w-130!" : "w-full max-w-5xl! gap-6")}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="border-b pb-5">
                    <DialogTitle className="text-xl">
                        {showStripePayment ? t("paymentWithStripe") : t("buySubscriptionPlan")}
                    </DialogTitle>
                </DialogHeader>

                {showStripePayment ? (
                    <StripePayment
                        selectedPackage={selectedPackage}
                        packageSettings={packageSettings}
                        onPaymentSuccess={closeModalUI}
                        setShowStripePayment={setShowStripePayment}
                        setPendingTransactionId={setPendingTransactionId}
                        navigate={navigate}
                    />
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="col-span-12 md:col-span-7">
                                <SelectedPlan selectedPackage={selectedPackage} />
                            </div>
                            <div className="col-span-12 md:col-span-5">
                                <h4 className="text-xl font-medium">{t("paymentSummary")}</h4>
                                {refer_earn_enabled && (
                                    <LoyaltyPoints
                                        referPoints={referPoints}
                                        isLoadingReferPointsBalance={isLoadingReferPointsBalance}
                                        appliedPoints={appliedPoints}
                                        onApply={handleApplyPoints}
                                        refer_min_points_to_use={refer_min_points_to_use}
                                    />
                                )}
                                <PaymentMethods
                                    isLoading={isLoading}
                                    activePaymentMethods={activePaymentMethods}
                                    isBankTransferActive={isBankTransferActive}
                                    selectedPaymentMethod={effectiveSelectedMethod}
                                    setSelectedPaymentMethod={setSelectedPaymentMethod}
                                />
                                <PaymentSummary
                                    selectedPackage={selectedPackage}
                                    appliedPoints={appliedPoints}
                                    refer_earn_enabled={refer_earn_enabled}
                                />
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="pt-6 mt-2 border-t flex items-center justify-end gap-6">
                            <button onClick={PaymentModalClose} className="text-sm px-3 py-2 rounded font-normal">
                                {t("cancel")}
                            </button>
                            <button onClick={() => handlePayment(effectiveSelectedMethod)} disabled={isPaying} className="text-sm px-3 py-2 rounded bg-primary text-white font-normal">
                                {isPaying ? t("loading") : t("confirmAndPay")}
                            </button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;