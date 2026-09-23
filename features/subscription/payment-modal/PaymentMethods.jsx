import { useTranslation } from "@/lang/useTranslation";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import CustomImage from "@/components/common/CustomImage";
import NoData from "@/components/empty-states/NoData";
import { cn } from "@/lib/utils";
import { BankIcon } from "@phosphor-icons/react";

const PaymentMethods = ({ isLoading, activePaymentMethods, isBankTransferActive, selectedPaymentMethod, setSelectedPaymentMethod }) => {
    const { t } = useTranslation();
    return (
        <div className="mt-6">
            <h4 className="text-sm font-bold text-muted-foreground">{t("paymentMethod")}</h4>
            <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="flex flex-col gap-3 mt-4">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 border rounded-lg p-3">
                            <Skeleton className="size-4 rounded-full" />
                            <Skeleton className="size-6 rounded" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    ))
                ) : activePaymentMethods.length > 0 || isBankTransferActive ? (
                    <>
                        {activePaymentMethods.map((method) => (
                            <div
                                key={method.id}
                                className={cn(
                                    "flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors",
                                    selectedPaymentMethod === method.id ? "border-primary" : "border hover:border-primary"
                                )}
                                onClick={() => setSelectedPaymentMethod(method.id)}
                            >
                                <RadioGroupItem value={method.id} id={method.id} />
                                <Label htmlFor={method.id} className="flex items-center gap-3 w-full cursor-pointer">
                                    <CustomImage src={method.icon} alt={method.id} className="size-6 object-contain rounded" />
                                    <span className="font-medium">{t(method.label)}</span>
                                </Label>
                            </div>
                        ))}

                        {isBankTransferActive && (
                            <div
                                className={cn(
                                    "flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors",
                                    selectedPaymentMethod === "bank_transfer" ? "border-primary" : "border hover:border-primary"
                                )}
                                onClick={() => setSelectedPaymentMethod("bank_transfer")}
                            >
                                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                                <Label htmlFor="bank_transfer" className="flex items-center gap-3 w-full cursor-pointer">
                                    <BankIcon size={24} className='rtl:scale-x-[-1]' />
                                    <span className="font-medium">{t("bankTransfer")}</span>
                                </Label>
                            </div>
                        )}
                    </>
                ) : (
                    <NoData title={t("noPaymentMethodAvailable")} />
                )}
            </RadioGroup>
        </div>
    );
};

export default PaymentMethods;