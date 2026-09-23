"use client";
import { useEffect } from "react";
import { getConsent, initAnalytics } from "@/lib/analytics";

export default function AnalyticsLoader() {
    useEffect(() => {
        if (getConsent() === "accepted") {
            initAnalytics();
        }
    }, []); // runs once on mount — cookie is already set by this point

    return null;
}