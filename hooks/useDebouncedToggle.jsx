"use client";
import { useRef, useCallback } from "react";

/**
 * Shared pattern for like/follow-style buttons backed by a pure-toggle API
 * (server just flips the state, no explicit on/off param).
 *
 * Flow per call:
 *  1. UI flips instantly (applyLocal) — feels responsive, no waiting on network.
 *  2. Actual API call is delayed by `delay` ms. Rapid re-clicks on the same
 *     key reset that timer instead of stacking new requests.
 *  3. When the timer finally fires, compare the pending value against the
 *     last *server-confirmed* value (`base`). If a user clicked back to the
 *     original state before the timer fired (like -> unlike), it's a net
 *     no-op and the API is never called at all.
 *  4. On success, `base` moves to the new confirmed value. On failure,
 *     applyLocal rolls the UI back to `base` and onError fires (e.g. toast).
 *
 * `key` (reelId, itemId, userId, ...) lets multiple independent
 * toggles (different cards in a grid, like vs. follow) debounce without
 * blocking each other — each key gets its own { base, timer } entry.
 */
export function useDebouncedToggle(delay = 500) {
  const pendingRef = useRef(new Map()); // key -> { base, timer }

  const toggle = useCallback(
    (key, currentValue, applyLocal, apiCall, onError) => {
      const nextValue = !currentValue;

      // Reuse the in-flight entry for this key if there is one, so `base`
      // always reflects the last value the server actually confirmed —
      // not whatever the UI happens to show mid-debounce.
      const entry = pendingRef.current.get(key) ?? { base: currentValue };
      pendingRef.current.set(key, entry);

      applyLocal(nextValue); // optimistic UI update, happens immediately

      clearTimeout(entry.timer);
      entry.timer = setTimeout(async () => {
        if (nextValue === entry.base) return; // net no-op — server untouched

        const res = await apiCall().catch((err) => {
          console.log("error", err);
          return null;
        });

        if (res?.data?.error === false) {
          entry.base = nextValue; // confirmed
        } else {
          applyLocal(entry.base); // rollback UI
          onError?.(res);
        }
      }, delay);
    },
    [delay]
  );

  return toggle;
}
