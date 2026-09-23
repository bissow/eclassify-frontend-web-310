import { useTranslation } from "@/lang/useTranslation";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/slices/settingSlice";
import { formatPriceAbbreviated } from "@/lib/format";
import { Separator } from "@/components/ui/separator";

const PaymentSummary = ({ selectedPackage, appliedPoints, refer_earn_enabled }) => {
    const { t } = useTranslation();
    const settings = useSelector(settingsData);
    const finalAmount = selectedPackage?.final_price - (appliedPoints || 0);

    return (
        <>
            <div className="mt-6">
                <h4 className="text-sm font-bold text-muted-foreground">{t("paymentSummary")}</h4>
                <div className="bg-muted border rounded-md p-3 mt-4 flex flex-col gap-3">
                    {refer_earn_enabled && (
                        <>
                            <div className="flex items-center gap-1 justify-between">
                                <span className="text-sm text-muted-foreground">{t("subscriptionPrice")}</span>
                                <span>{formatPriceAbbreviated(selectedPackage?.final_price, t, settings)}</span>
                            </div>
                            <div className="flex items-center gap-1 justify-between">
                                <span className="text-sm text-muted-foreground">{t("loyaltyPointDiscount")}</span>
                                <span className="text-destructive">-{formatPriceAbbreviated(appliedPoints || 0, t, settings)}</span>
                            </div>
                            <Separator />
                        </>
                    )}
                    <div className="flex items-center gap-1 justify-between">
                        <span>{t("finalAmount")}</span>
                        <span className="text-xl text-primary">{formatPriceAbbreviated(finalAmount, t, settings)}</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentSummary;