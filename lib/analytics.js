import { getAnalytics, isSupported } from "firebase/analytics";
import { app } from "@/lib/firebase";

let analyticsInstance = null;

export async function initAnalytics() {
    try {
        const supported = await isSupported();
        if (!supported) return null;
        if (analyticsInstance) return analyticsInstance;
        analyticsInstance = getAnalytics(app);
        return analyticsInstance;
    } catch (err) {
        console.error("Analytics init failed:", err);
        return null;
    }
}

export const CONSENT_KEY = "cookie_consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // 1 year in seconds

export function getConsent() {
    if (typeof document === "undefined") return null;
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${CONSENT_KEY}=`));
    return match ? match.split("=")[1] : null; // "accepted" | "rejected" | null
}

export function setConsent(value) {
    document.cookie = `${CONSENT_KEY}=${value}; max-age=${CONSENT_MAX_AGE}; path=/; SameSite=Lax`;
}
