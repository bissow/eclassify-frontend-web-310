import { useTranslation } from "@/lang/useTranslation";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/slices/settingSlice";
import { formatPriceAbbreviated } from "@/lib/format";
import CustomImage from "@/components/common/CustomImage";
import { useState } from "react";
import { getPackageVars } from "@/features/subscription/lib/getPackageVars";
import { ArrowRightIcon, CheckIcon, PlayCircleIcon } from "@phosphor-icons/react";

const BuyPackageCard = ({ pckg, handlePurchasePackage }) => {
  const { t } = useTranslation();
  const settings = useSelector(settingsData);

    const [isFlipped, setIsFlipped] = useState(false);

    const { descriptionItems, totalDays, totalItems, listingDurationDays } = getPackageVars(pckg);

    return (
        <div className="perspective-1000 h-full">
            <div
                className={`h-full relative transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? "rotate-y-180" : ""
                    }`}
            >
                <div
                    className={`h-full backface-hidden rounded-lg relative p-4 sm:p-8 shadow-xs border bg-white flex flex-col ${isFlipped ? "pointer-events-none" : ""}`}
                >
                    {/* Sale Badge */}
                    {pckg?.discount_in_percentage > 0 && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                            <span className="bg-primary text-white px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap">
                                {t("save")} {pckg?.discount_in_percentage}% {t("off")}
                            </span>
                        </div>
                    )}

                    {/* Card Header */}
                    <div className="flex items-center gap-4">
                        <CustomImage
                            height={80}
                            width={80}
                            src={pckg.icon}
                            alt="Bronze medal"
                            className="aspect-square rounded-lg"
                        />
                        <div className="flex flex-col gap-2 overflow-hidden">
                            <h2 className="text-xl font-medium mb-1 line-clamp-2 overflow-hidden">
                                {pckg?.translated_name || pckg?.name}
                            </h2>
                            <div className="flex items-center gap-1">
                                {pckg?.final_price !== 0 ? (
                                    <p className="text-xl font-bold">
                                        {formatPriceAbbreviated(pckg?.final_price, t, settings)}
                                    </p>
                                ) : (
                                    t("Free")
                                )}
                                {pckg?.price > pckg?.final_price && (
                                    <p className="text-xl font-bold line-through text-gray-500">
                                        {formatPriceAbbreviated(pckg?.price, t, settings)}
                                    </p>
                                )}
                            </div>
                            {
                                pckg.is_reel_allowed == 1 &&
                                <div className="bg-muted py-1 px-2 rounded-md text-xs w-fit flex items-center gap-1">
                                    <PlayCircleIcon size={16} />
                                    <span>
                                        {t('videoAdsSupported')}
                                    </span>
                                </div>
                            }
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-b py-4 my-4 flex items-center justify-between gap-2">
                        <span className="font-bold">
                            {totalItems === "unlimited"
                                ? t("unlimited")
                                : totalItems}{" "}
                            {t("ads")}
                        </span>

                        <span className="text-xs rounded text-muted-foreground capitalize px-2 py-1 bg-muted">
                            {totalDays} {t("days")}
                        </span>
                    </div>

                    <div className="overflow-y-auto max-h-56 mb-3">
                        <h6 className="text-base font-medium">{t('featuresList')}</h6>
                        {/* Feature List */}
                        <div className="flex flex-col gap-2 p-3 text-sm">
                            <div className="flex items-center gap-3">
                                <span
                                    className="text-primary"
                                >
                                    <CheckIcon weight="bold" />
                                </span>
                                <span className="capitalize">
                                    {t("listingDuration")}: {listingDurationDays} {t("days")}
                                </span>
                            </div>
                            {pckg.categories_path.length === 0 && (
                                <div className="flex items-center gap-3">
                                    <span
                                        className="text-primary"
                                    >
                                        <CheckIcon weight="bold" />
                                    </span>
                                    <span className="text-normal ">{t("allCategoriesIncluded")}</span>
                                </div>
                            )}
                            {(pckg?.allows_promotions === 1 || pckg?.allows_promotions === true || pckg?.type === 'promotional') && (
                                <div className="flex items-center gap-3">
                                    <span className="text-primary">
                                        <CheckIcon weight="bold" />
                                    </span>
                                    <span className="text-normal">
                                        {t("salesCampaignPromotionsIncluded")}
                                        {pckg?.promotion_item_limit > 0 ? ` (${pckg.promotion_item_limit} ${t("items")})` : ` (${t("unlimited")})`}
                                    </span>
                                </div>
                            )}
                            {(pckg?.allows_daily_bump_up === 1 || pckg?.allows_daily_bump_up === true) && (
                                <div className="flex items-center gap-3">
                                    <span className="text-primary">
                                        <CheckIcon weight="bold" />
                                    </span>
                                    <span className="text-normal">
                                        {t("dailyBumpUpIncluded")}
                                        {pckg?.daily_bump_up_limit > 0 ? ` (${pckg.daily_bump_up_limit} ${t("times")})` : ` (${t("unlimited")})`}
                                    </span>
                                </div>
                            )}
                            {(pckg?.allows_top_ad === 1 || pckg?.allows_top_ad === true) && (
                                <div className="flex items-center gap-3">
                                    <span className="text-primary">
                                        <CheckIcon weight="bold" />
                                    </span>
                                    <span className="text-normal">
                                        {t("topAdBoostIncluded")}
                                        {pckg?.top_ad_limit > 0 ? ` (${pckg.top_ad_limit} ${t("items")})` : ` (${t("unlimited")})`}
                                    </span>
                                </div>
                            )}
                            {(pckg?.allows_spotlight === 1 || pckg?.allows_spotlight === true) && (
                                <div className="flex items-center gap-3">
                                    <span className="text-primary">
                                        <CheckIcon weight="bold" />
                                    </span>
                                    <span className="text-normal">
                                        {t("spotlightCarouselIncluded")}
                                        {pckg?.spotlight_limit > 0 ? ` (${pckg.spotlight_limit} ${t("items")})` : ` (${t("unlimited")})`}
                                    </span>
                                </div>
                            )}
                            {descriptionItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <span
                                        className="text-primary"
                                    >
                                        <CheckIcon weight="bold" />
                                    </span>
                                    <span className="text-normal ">{item}</span>
                                </div>
                            ))}
                        </div>
                        {pckg.categories_path.length > 0 && (
                            <>
                                <h6 className="text-base font-medium">{t("categoryIncludes")}</h6>
                                <div className="flex flex-col gap-2 p-3 text-sm">
                                    {pckg.categories_path.slice(0, 2).map((category) => (
                                        <div key={category.id} className="flex items-center gap-3">
                                            <span
                                                className="text-primary"
                                            >
                                                <CheckIcon weight="bold" />
                                            </span>
                                            <span className="text-normal ">
                                                {category.translated_name || category.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {pckg.categories_path.length > 2 && (
                                    <button
                                        onClick={() => setIsFlipped(true)}
                                        className="text-sm underline px-3 text-primary"
                                    >
                                        {t("seeMore")}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex items-center justify-center h-12 max-h-12 p-4 md:p-0 mt-auto">
                        <button
                            onClick={() => handlePurchasePackage(pckg)}
                            className="w-full flex py-1 px-3 md:py-2 md:px-4 lg:py-3 lg:px-6 rounded-lg  items-center text-primary  justify-center hover:bg-primary border hover:text-white transition-all duration-300"
                        >
                            <span className="font-light text-lg">{t("choosePlan")}</span>
                            <span className="ml-2">
                                <ArrowRightIcon size={20} className="rtl:scale-x-[-1]" weight="bold" />
                            </span>
                        </button>
                    </div>
                </div>
                <div className={`absolute inset-0 rotate-y-180 backface-hidden rounded-lg p-4 sm:p-8 shadow-xs border bg-white flex flex-col ${!isFlipped ? "pointer-events-none" : ""}`}>
                    <h6 className="text-lg font-medium mb-4">{t("allCategories")}</h6>
                    <div className="flex flex-col gap-2 overflow-y-auto flex-1">
                        {pckg.categories_path.map((category) => (
                            <div key={category.id} className="flex items-center gap-3">
                                <CheckIcon weight="bold" className='text-primary' />
                                <span>{category.translated_name || category.name}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsFlipped(false)}
                        className="mt-4 text-sm underline text-primary"
                    >
                        {t("back")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BuyPackageCard;
