"use client";
import { useEffect, useState } from "react";

// Detects Safari (which lacks reliable geolocation permission behavior).
// Pure local state — never persisted, so there's nothing that can race
// against SSR hydration. Defaults to true (assume supported) until the
// effect corrects it post-mount, same as the previous default.
export function useIsBrowserSupported() {
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);

  useEffect(() => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) setIsBrowserSupported(false);
  }, []);

  return isBrowserSupported;
}
