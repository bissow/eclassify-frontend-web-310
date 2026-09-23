"use client";
import AdSlot from "./AdSlot";
import { AD_UNITS } from "./adConfig";
import { useAdsense } from "./useAdsense";

export default function AdUnit({ type, className }) {
    const settings = useAdsense();

    if (!settings.adsense_enabled) return null;

    const config = AD_UNITS[type];
    if (!config) {
        console.warn(`[AdUnit] Unknown ad type: "${type}"`);
        return null;
    }

    const slotId = settings[config.slotKey];
    if (!slotId) return null;

    return (
        <AdSlot
            adSlotId={slotId}
            height={config.height}
            className={className}
        />
    );
}