"use client";
import { useMemo, useSyncExternalStore } from "react";
import { LOCATION_COOKIE, LOCATION_COOKIE_MAX_AGE_SECONDS } from "./constants";

const emptyCityData = {
  area: "",
  areaId: "",
  city: "",
  state: "",
  country: "",
  lat: "",
  long: "",
  formattedAddress: "",
};

const readCookie = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${LOCATION_COOKIE}=([^;]*)`)
  );
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch (error) {
    console.error("Error parsing location cookie:", error);
    return null;
  }
};

// Unparsed cookie text. useSyncExternalStore needs a primitive here — a
// string compares by value, so no snapshot-caching plumbing is needed (an
// object literal would compare by reference and re-render on every check).
const readRawCookie = () => {
  if (typeof document === "undefined") return null;
  return (
    document.cookie.match(
      new RegExp(`(?:^|;\\s*)${LOCATION_COOKIE}=([^;]*)`)
    )?.[1] ?? null
  );
};

// Purely client-side signal for components that just display the current
// location (e.g. HomeHeader's location label) — lets them re-read the cookie
// and update instantly without a full router.refresh() re-fetching every
// server section on the page. See lib/location.js usage in HomeHeader.jsx.
export const LOCATION_CHANGE_EVENT = "locationchange";

const writeCookie = (parsed) => {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(parsed));
  document.cookie = `${LOCATION_COOKIE}=${value}; path=/; max-age=${LOCATION_COOKIE_MAX_AGE_SECONDS}`;
  window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
};

// Client-side reads. Only call these from event handlers, useEffect, or
// components behind dynamic(..., { ssr: false }) — calling during the render
// of an SSR'd component would read `document` on the client but not the
// server, causing a hydration mismatch. Server components should use
// lib/locationCookie.js's getLocationCookie() and pass the value down as a
// prop instead.
export const getCityDataClient = () => {
  const parsed = readCookie();
  return {
    area: parsed?.area ?? emptyCityData.area,
    areaId: parsed?.areaId ?? emptyCityData.areaId,
    city: parsed?.city ?? emptyCityData.city,
    state: parsed?.state ?? emptyCityData.state,
    country: parsed?.country ?? emptyCityData.country,
    lat: parsed?.lat ?? emptyCityData.lat,
    long: parsed?.long ?? emptyCityData.long,
    formattedAddress: parsed?.formattedAddress ?? emptyCityData.formattedAddress,
  };
};

export const getKmRangeClient = () => Number(readCookie()?.kmRange) || 0;

export const saveCity = (data) => {
  writeCookie({ ...data, kmRange: getKmRangeClient() });
};

export const saveKilometerRange = (value) => {
  writeCookie({ ...getCityDataClient(), kmRange: value });
};

export const resetCityData = () => {
  writeCookie({ ...emptyCityData, kmRange: getKmRangeClient() });
};

const subscribeToLocationChange = (callback) => {
  window.addEventListener(LOCATION_CHANGE_EVENT, callback);
  return () => window.removeEventListener(LOCATION_CHANGE_EVENT, callback);
};

// Reactive read of the location cookie, hydration-safe. getServerSnapshot
// returns `undefined` (a sentinel no real cookie value can produce — an
// unset cookie reads as `null`) so both server render and client hydration
// render serverCityData (the SSR-read prop) — no mismatch. Right after mount,
// and on every LOCATION_CHANGE_EVENT after, useSyncExternalStore re-checks
// the live cookie itself, so there's no missed-update window regardless of
// when/where the cookie was last written (e.g. saveCity() on a page whose
// header doesn't exist yet, like /landing before navigating home).
export const useLiveCityData = (serverCityData) => {
  const raw = useSyncExternalStore(
    subscribeToLocationChange,
    readRawCookie,
    () => undefined
  );
  return useMemo(
    () =>
      raw === undefined
        ? serverCityData
        : { ...getCityDataClient(), kmRange: getKmRangeClient() },
    [raw, serverCityData]
  );
};
