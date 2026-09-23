'use client';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useNavigate } from "@/hooks/useNavigate";
import { SealCheckIcon, ShoppingBagOpenIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react";
import { useTranslation } from "@/lang/useTranslation";

const PackageRequiredModal = ({ open, onClose, initialStep = 1, categoryId = null, customMessage = null }) => {
    const [step, setStep] = useState(initialStep);
    const { navigate } = useNavigate();
    const { t } = useTranslation();

    const handleOnClose = () => {
        setStep(1);
        onClose();
    };

    const handleSelectPlan = (type) => {
        handleOnClose();
        if (type === 'listing') {
            const categoryQuery = categoryId ? `&category_id=${categoryId}` : "";
            navigate(`/subscription?plan=listing${categoryQuery}`);
        } else {
            navigate("/subscription?plan=featured");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOnClose}>
            <DialogContent
                className={`${step === 1 ? "max-w-90 sm:max-w-100" : "max-w-145"} [&>button]:hidden p-0! overflow-hidden border-none shadow-2xl`}
            >
                {/* Accessible but visually hidden title/description */}
                <DialogTitle className="sr-only">
                    {step === 1 ? t("noPackage") : t("selectSubscriptionType")}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    {step === 1 ? t("subscribeBeforeAdListing") : "Choose between ad listing and feature plans"}
                </DialogDescription>

                {step === 1 ? (
                    <div className="p-6">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="size-20 rounded-full bg-muted flex items-center justify-center">
                                <WarningCircleIcon className="size-14 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg">{t("noPackage")}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {customMessage || t("subscribeBeforeAdListing")}
                            </p>
                        </div>
                        <div className="flex gap-3 mt-6 pt-6 border-t font-medium">
                            <DialogClose asChild>
                                <Button variant="outline" className="flex-1 bg-muted hover:bg-muted/80">{t('cancel')}</Button>
                            </DialogClose>
                            <Button
                                className="flex-1"
                                onClick={() => handleSelectPlan('listing')}
                            >
                                {t('subscribe')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between p-4 px-6 border-b">
                            <h3 className="font-semibold text-lg text-gray-800">{t('selectSubscriptionType')}</h3>
                            <button
                                onClick={handleOnClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <XIcon size={20} className="text-muted-foreground" weight="bold" />
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Ad Listing Plan */}
                            <button
                                onClick={() => handleSelectPlan('listing')}
                                className="group flex flex-col items-center p-6 border rounded-2xl text-center"
                            >
                                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300">
                                    <ShoppingBagOpenIcon className='size-8 text-primary' />
                                </div>
                                <h4 className="font-semibold mb-1">{t('adListingPlan')}</h4>
                                <p className="text-xs text-muted-foreground">{t('buyCategoryBasedSubscription')}</p>
                            </button>

                            {/* Feature Ads Plan */}
                            <button
                                onClick={() => handleSelectPlan('feature')}
                                className="group flex flex-col items-center p-6 border rounded-2xl transition-all duration-300 text-center"
                            >
                                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300">
                                    <SealCheckIcon className="size-8 text-primary" />
                                </div>
                                <h4 className="font-semibold mb-1">{t('featuredAdPlan')}</h4>
                                <p className="text-xs text-muted-foreground">{t('increaseVisibilityForSpecificAds')}</p>
                            </button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog >
    );
};

export default PackageRequiredModal;
