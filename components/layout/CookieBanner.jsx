"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lang/useTranslation";
import { getConsent, setConsent, initAnalytics } from "@/lib/analytics";
import ClarityAnalytics from "@/components/layout/ClarityAnalytics";
import { CookieIcon } from "@phosphor-icons/react";

export function CookieBanner() {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const [clarityEnabled, setClarityEnabled] = useState(false);

    useEffect(() => {
        // Only show if no consent choice has been made yet
        const currentConsent = getConsent();
        if (!currentConsent) {
            setVisible(true);
        }
    }, []);

    const handleAccept = async () => {
        setConsent("accepted");
        setVisible(false);
        setClarityEnabled(true);
        await initAnalytics();
    };

    const handleReject = () => {
        setConsent("rejected");
        setVisible(false);
    };

    return (
        <>
            {clarityEnabled && <ClarityAnalytics />}
            {visible && (
                <div className="container fixed bottom-4 left-1/2 z-50 flex w-full -translate-x-1/2 justify-center">
                    <div className="flex flex-col md:flex-row w-full items-center justify-between gap-4 rounded-xl border bg-white p-4 sm:p-6 shadow-md">
                        {/* Icon */}

                        <div className="flex items-center gap-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-muted">
                                <CookieIcon className="size-6 text-primary" />
                            </div>
                            <p className="flex-1 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
                                {t('cookieDescription')}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-2">
                            <Button
                                size="sm"
                                onClick={handleAccept}
                            >
                                {t('accept')}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleReject}
                            >
                                {t('reject')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}