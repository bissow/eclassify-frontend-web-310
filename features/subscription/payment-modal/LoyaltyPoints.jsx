import { useTranslation } from "@/lang/useTranslation";
import CustomImage from "@/components/common/CustomImage";
import loyaltyCoin from "@/public/assets/loyalty-coin.png";
// import { FaRegCheckCircle } from "react-icons/fa";

const LoyaltyPoints = ({ referPoints, isLoadingReferPointsBalance, appliedPoints, onApply, refer_min_points_to_use }) => {

    const isApplied = appliedPoints > 0;

    return (
        <div className="mt-6 p-3 border rounded-md">
            {isApplied
                ? <LoyaltyPointsApplied onRemove={onApply} />
                : <LoyaltyPointsIdle
                    referPoints={referPoints}
                    isLoadingReferPointsBalance={isLoadingReferPointsBalance}
                    onApply={onApply}
                    refer_min_points_to_use={refer_min_points_to_use}
                />
            }
        </div>
    );
};

export default LoyaltyPoints;


const LoyaltyPointsApplied = ({ onRemove }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-3">
            <div className="size-10 flex items-center justify-center bg-muted rounded-full">
                {/* <FaRegCheckCircle className="size-5 text-[#198754]" /> */}
            </div>
            <p className="text-sm">{t("loyaltyPointApplied")}</p>
        </div>
        <button onClick={onRemove} className="px-3 py-2 rounded text-sm bg-transparent text-destructive">
            {t("remove")}
        </button>
    </div>
);
}

const LoyaltyPointsIdle = ({ referPoints, isLoadingReferPointsBalance, onApply, refer_min_points_to_use }) => {
  const { t } = useTranslation();
  return (
    <>
        <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-3">
                <div className="size-10 flex items-center justify-center bg-muted rounded-full">
                    <CustomImage src={loyaltyCoin} alt="Loyalty Coin" width={24} height={24} />
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground">{t("loyaltyCoins")}</p>
                    <p className="text-xl font-medium">
                        {isLoadingReferPointsBalance ? t("loading") : referPoints}
                    </p>
                </div>
            </div>
            <button onClick={onApply} disabled={isLoadingReferPointsBalance} className="bg-primary text-white px-3 py-2 rounded text-sm">
                {t("apply")}
            </button>
        </div>
    </>
);
}