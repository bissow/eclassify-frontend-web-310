'use client'
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { getMinRange, getMaxRange } from "@/store/slices/settingSlice";
import { useMemo } from "react";
import { knownParams } from "@/lib/constants";

export const useAdsFilters = () => {
    const searchParams = useSearchParams();
    const min_range = useSelector(getMinRange);
    const max_range = useSelector(getMaxRange);
    const query = searchParams.get("query") || "";
    const country = searchParams.get("country") || "";
    const state = searchParams.get("state") || "";
    const city = searchParams.get("city") || "";
    const areaId = searchParams.get("areaId") || "";
    const location = searchParams.get("location") || "";
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));

    const min_price = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : "";
    const max_price = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : "";
    const date_posted = searchParams.get("date_posted") || "";
    const sortBy = searchParams.get("sort_by") || "default";
    const km_range_raw = searchParams.get("km_range") || "";
    const km_range = (km_range_raw && Number(km_range_raw) > 0)
        ? Math.min(Math.max(Number(km_range_raw), min_range), max_range).toString()
        : "";

    // 3. Dynamic Extra Details (Custom Fields) logic
    const initialExtraDetails = useMemo(() => {
        const temprorayExtraDet = {};
        Array.from(searchParams.entries() || []).forEach(([key, value]) => {
            if (!knownParams?.includes(key)) {
                temprorayExtraDet[key] = value?.includes(",")
                    ? value?.split(",")
                    : value;
            }
        });
        return temprorayExtraDet;
    }, [
        JSON.stringify(
            Array.from(searchParams.entries()).filter(
                ([key]) => !knownParams.includes(key)
            )
        ),
    ]);

    return {
        query, country, state, city, areaId, location, lat, lng,
        min_price, max_price, date_posted, sortBy, km_range,
        initialExtraDetails,
        searchParams
    };
};
