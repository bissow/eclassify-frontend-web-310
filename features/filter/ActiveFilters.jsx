"use client";
import { Badge } from "@/components/ui/badge";
import { useAdsFilters } from "@/features/filter/hooks/useAdsFilters";
import { useTranslation } from "@/lang/useTranslation";
import { useNavigate } from "@/hooks/useNavigate";
import { useAdsBasePath } from "@/hooks/useAdsBasePath";
import { XCircleIcon } from "@phosphor-icons/react";

const ActiveFilters = ({ customFields }) => {
  const { t } = useTranslation();

    const basePath = useAdsBasePath();
    const { navigate } = useNavigate();

    const {
        query, country, state, city, areaId, location,
        km_range, date_posted, min_price, max_price,
        initialExtraDetails, searchParams
    } = useAdsFilters();

    const newSearchParams = new URLSearchParams(searchParams);

    const isMinPrice = min_price !== "" && min_price !== null && Number(min_price) >= 0;

    const getActiveFilterCount = () => {
        let count = 0;
        if (country || state || city || areaId) count++;
        if (km_range) count++;
        if (query) count++;
        if (date_posted) count++;
        if (isMinPrice && max_price) count++;
        if (initialExtraDetails && Object.keys(initialExtraDetails).length > 0) {
            count += Object.keys(initialExtraDetails).length;
        }
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    if (activeFilterCount === 0) return null;

    const postedSince =
        date_posted === "all-time" ? t("allTime")
            : date_posted === "today" ? t("today")
                : date_posted === "within-1-week" ? t("within1Week")
                    : date_posted === "within-2-week" ? t("within2Weeks")
                        : date_posted === "within-1-month" ? t("within1Month")
                            : date_posted === "within-3-month" ? t("within3Months")
                                : "";

    const pushFilters = (params) => {
        const qs = params.toString();
        navigate(`${basePath}${qs ? `?${qs}` : ""}`, { scroll: false });
    };

    const handleClearLocation = () => {
        ["country", "state", "city", "area", "areaId", "lat", "lng", "km_range", "location"].forEach((k) => newSearchParams.delete(k));
        pushFilters(newSearchParams);
    };

    const handleClearRange = () => {
        newSearchParams.delete("km_range");
        pushFilters(newSearchParams);
    };

    const handleClearDatePosted = () => {
        newSearchParams.delete("date_posted");
        pushFilters(newSearchParams);
    };

    const handleClearBudget = () => {
        newSearchParams.delete("min_price");
        newSearchParams.delete("max_price");
        pushFilters(newSearchParams);
    };

    const handleClearExtraDetail = (keyToRemove) => {
        newSearchParams.delete(keyToRemove);
        pushFilters(newSearchParams);
    };

    const handleClearQuery = () => {
        newSearchParams.delete("query");
        pushFilters(newSearchParams);
    };

    const handleClearAll = () => {
        navigate(basePath, { scroll: false });
    };

    return (
        <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2 flex-wrap">
                {query && (
                    <Badge variant="outline" className="px-4 text-base font-normal py-2 rounded-full flex items-center gap-2 bg-muted">
                        <span>{t("search")}: {query}</span>
                        <XCircleIcon size={22} weight="fill" className="cursor-pointer" onClick={handleClearQuery} />
                    </Badge>
                )}

                {location && (
                    <Badge variant="outline" className="px-4 text-base font-normal py-2 rounded-full flex items-center gap-2 bg-muted">
                        <span>{t("location")}: {location}</span>
                        <XCircleIcon size={22} weight="fill" className="cursor-pointer" onClick={handleClearLocation} />
                    </Badge>
                )}

                {Number(km_range) > 0 && (
                    <Badge variant="outline" className="px-4 text-base font-normal py-2 rounded-full flex items-center gap-2 bg-muted">
                        <span>{t("nearByRange")}: {km_range} KM</span>
                        <XCircleIcon size={22} weight="fill" className="cursor-pointer" onClick={handleClearRange} />
                    </Badge>
                )}

                {date_posted && (
                    <Badge variant="outline" className="px-4 text-base font-normal py-2 rounded-full flex items-center gap-2 bg-muted">
                        <span>{t("datePosted")}: {postedSince}</span>
                        <XCircleIcon size={22} weight="fill" className="cursor-pointer" onClick={handleClearDatePosted} />
                    </Badge>
                )}

                {isMinPrice && max_price && (
                    <Badge variant="outline" className="px-4 text-base font-normal py-2 rounded-full flex items-center gap-2 bg-muted">
                        <span>{t("budget")}: {min_price}-{max_price}</span>
                        <XCircleIcon size={22} weight="fill" className="cursor-pointer" onClick={handleClearBudget} />
                    </Badge>
                )}

                {initialExtraDetails && Object.entries(initialExtraDetails || {}).map(([key, value]) => {
                    const field = customFields.find((f) => f.id.toString() === key.toString());
                    const fieldName = field?.translated_name || field?.name;
                    const getTranslatedValue = (val) => {
                        if (!field?.values || !field?.translated_value) return val;
                        const idx = field.values.indexOf(val);
                        return idx !== -1 ? field.translated_value[idx] : val;
                    };
                    const displayValue = Array.isArray(value)
                        ? value.map((v) => getTranslatedValue(v)).join(", ")
                        : getTranslatedValue(value);

                    return (
                        <Badge key={key} variant="outline" className="px-4 text-base font-normal py-2 rounded-full flex items-center gap-2 bg-muted">
                            <span>{fieldName}: {displayValue}</span>
                            <XCircleIcon size={22} weight="fill" className="cursor-pointer" onClick={() => handleClearExtraDetail(key)} />
                        </Badge>
                    );
                })}
            </div>

            {activeFilterCount > 1 && (
                <button className="text-primary whitespace-nowrap" onClick={handleClearAll}>
                    {t("clearAll")}
                </button>
            )}
        </div>
    );
};

export default ActiveFilters;
