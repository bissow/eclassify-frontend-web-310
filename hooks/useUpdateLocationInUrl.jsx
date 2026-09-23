"use client";

import { useSearchParams } from "next/navigation";
import { getCityDataClient, getKmRangeClient } from "@/lib/location";
import { useAdsBasePath } from "@/hooks/useAdsBasePath";
import { useNavigate } from "@/hooks/useNavigate";

// overrides.cityData/overrides.kmRange let SSR'd callers (FeaturedSections,
// HeaderCategories — both render <CustomLink href> during the initial
// server render) pass down the same server-read location cookie value
// instead of reading document.cookie directly, which would only exist
// client-side and cause a hydration mismatch on that href.
export const useUpdateLocationInUrl = (overrides = {}) => {
    const searchParams = useSearchParams()
    const { navigate } = useNavigate();
    const cityData = overrides.cityData ?? getCityDataClient();
    const KmRange = overrides.kmRange ?? getKmRangeClient();
    const basePath = useAdsBasePath();


    const generateAdsUrl = (additionalParams = {}, useHeaderLocation = true) => {
        const { category, ...restParams } = additionalParams;
        const params = new URLSearchParams();

        // A. Handle Location
        if (useHeaderLocation) {
            // Take location from the location cookie (Header)
            if (cityData.country) params.set("country", cityData.country);
            if (cityData.state) params.set("state", cityData.state);
            if (cityData.city) params.set("city", cityData.city);
            if (cityData.area) params.set("area", cityData.area);
            if (cityData.areaId) params.set("areaId", cityData.areaId);
            const locationLabel = cityData.address_translated || cityData.formattedAddress;
            if (locationLabel) params.set("location", locationLabel);
            if (cityData.lat) params.set("lat", cityData.lat);
            if (cityData.long) params.set("lng", cityData.long);
            if (Number(KmRange) > 0 && (cityData.city || cityData.areaId)) {
                params.set("km_range", KmRange.toString());
            }
        } else {
            // Take location + filters from current URL (ads page Filter panel)
            const currentParams = getParamsFromUrl();
            Object.entries(currentParams).forEach(([key, value]) => {
                if (value) params.set(key, value);
            });
        }

        // B. Handle Additional Params — category goes in path, rest in query string
        Object.entries(restParams).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        const queryString = params.toString();
        // category is a path segment (e.g. "electronics" or "electronics/computers-laptops")
        const categoryPath = category && category !== "all-categories" ? `/${category}` : "";
        const basePath = `/ads${categoryPath}`;

        return queryString ? `${basePath}?${queryString}` : basePath;
    };


    const updateLocationInUrl = (data) => {
        const params = new URLSearchParams(searchParams);
        // Clear old location and range params
        ["country", "state", "city", "area", "areaId", "lat", "lng", "km_range", "location"].forEach((key) =>
            params.delete(key)
        );
        // Set new ones
        if (data.country) params.set("country", data.country);
        if (data.state) params.set("state", data.state);
        if (data.city) params.set("city", data.city);
        if (data.area) params.set("area", data.area);
        if (data.areaId) params.set("areaId", data.areaId);
        const locationLabel = data.address_translated || data.formattedAddress;
        if (locationLabel) params.set("location", locationLabel);
        // Add lat/long only if city or areaId exists
        if (data.lat) params.set("lat", data.lat);
        if (data.long) params.set("lng", data.long);

        if (Number(data?.km_range) > 0) {
            params.set("km_range", data.km_range.toString());
        }
        const queryString = params.toString();
        navigate(`${basePath}${queryString ? `?${queryString}` : ""}`, {
            scroll: false,
        });
    };

    const getParamsFromUrl = () => {
        const locationSearchParams = {
            country: searchParams.get("country"),
            state: searchParams.get("state"),
            city: searchParams.get("city"),
            area: searchParams.get("area"),
            areaId: searchParams.get("areaId"),
            lat: searchParams.get("lat"),
            lng: searchParams.get("lng"),
            km_range: searchParams.get("km_range"),
            location: searchParams.get("location"),
            min_price: searchParams.get("min_price"),
            max_price: searchParams.get("max_price"),
            sort_by: searchParams.get("sort_by"),
            date_posted: searchParams.get("date_posted"),
            query: searchParams.get("query"),
        }
        return locationSearchParams;
    }

    return { updateLocationInUrl, getParamsFromUrl, generateAdsUrl };
};
