"use client";

import { useState } from "react";
import { MapPinIcon, XIcon, InfoIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export default function LocationMismatchAlert({ warningData, className }) {
  const [dismissed, setDismissed] = useState(false);

  if (!warningData || !warningData.warning || dismissed) {
    return null;
  }

  const distanceFormatted = warningData.distance?.formatted || 
    (warningData.distance_km ? `${warningData.distance_km} km` : null);
  const storeLocation = warningData.store_location;
  const locationText = [storeLocation?.city, storeLocation?.state, storeLocation?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      role="alert"
      className={cn(
        "relative overflow-hidden rounded-xl border border-amber-300/80 bg-amber-50/95 p-4 shadow-sm backdrop-blur transition-all duration-300 dark:border-amber-800/70 dark:bg-amber-950/40 dark:text-amber-100",
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400">
          <MapPinIcon size={22} weight="duotone" />
        </div>

        <div className="flex-1 text-sm">
          <div className="flex flex-wrap items-center gap-2 font-semibold text-amber-900 dark:text-amber-200">
            <span>Location Notice: Out of Area Seller</span>
            {distanceFormatted && (
              <span className="inline-flex items-center rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                ~{distanceFormatted} away
              </span>
            )}
          </div>

          <p className="mt-1 leading-relaxed text-amber-800/90 dark:text-amber-200/85">
            {warningData.message ||
              `This seller is located in ${locationText || "a different region"}. You can still freely explore items and contact them, but shipping or local pickup availability may vary.`}
          </p>

          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-amber-700/80 dark:text-amber-300/75">
            <InfoIcon size={14} weight="bold" />
            <span>Browsing and inquiries are not restricted.</span>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss location warning"
          className="rounded-lg p-1 text-amber-600/70 transition-colors hover:bg-amber-200/50 hover:text-amber-900 dark:text-amber-400/80 dark:hover:bg-amber-900/50 dark:hover:text-amber-100"
        >
          <XIcon size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}
