// components/ads/AdSlot.jsx
"use client";
import { useEffect, useRef } from "react";
import { useAdsense } from "./useAdsense";

export default function AdSlot({ adSlotId, height = 250, className = "" }) {
    const adRef = useRef(null);
    const { adsense_client_id, adsense_enabled, adsense_mode } = useAdsense();

    const isActive = adsense_enabled && adsense_mode === "manual" && adsense_client_id;

    useEffect(() => {
        if (!isActive) return;

        window.adsbygoogle = window.adsbygoogle || [];
        let timer;
        let attempts = 0;
        const maxAttempts = 20;

        const tryPush = () => {
            attempts++;
            if (adRef.current?.offsetWidth > 0) {
                try {
                    if (!adRef.current.hasAttribute("data-adsbygoogle-status") && !adRef.current.hasAttribute("data-pushed")) {
                        adRef.current.setAttribute("data-pushed", "true");
                        window.adsbygoogle.push({});
                    }
                } catch (err) {
                    console.error("AdSense error:", err);
                }
                return;
            }
            if (attempts < maxAttempts) timer = setTimeout(tryPush, 100);
        };

        tryPush();
        return () => { if (timer) clearTimeout(timer); };
    }, [isActive, adSlotId, adsense_client_id]);

    if (!isActive) return null;

    return (
        <div style={{ width: "100%", height }} className={className}>
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client={adsense_client_id}
                data-ad-slot={adSlotId}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    );
}