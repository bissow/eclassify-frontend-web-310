import { getCountryCallingCode } from "react-phone-number-input";
import { countryLocaleMap, languageLocaleMap } from "@/lang";

export const timeAgo = (createdAt, locale = "en", t) => {
  const date = new Date(createdAt);
  if (isNaN(date)) return "";
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 60) return t ? t("justNow") : "just now";
  let rtf;
  try {
    rtf = new Intl.RelativeTimeFormat(locale, { numeric: "always", style: "narrow" });
  } catch {
    rtf = new Intl.RelativeTimeFormat("en", { numeric: "always", style: "narrow" });
  }
  if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), "minute");
  if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), "hour");
  if (seconds < 2592000) return rtf.format(-Math.floor(seconds / 86400), "day");
  if (seconds < 31536000) return rtf.format(-Math.floor(seconds / 2592000), "month");
  return rtf.format(-Math.floor(seconds / 31536000), "year");
};

export const extractYear = (dateString) => {
  const date = new Date(dateString);
  return date.getFullYear();
};

export const formatPriceAbbreviated = (price, t, settings) => {
  if (
    price === null ||
    price === undefined ||
    (typeof price === "string" && price.trim() === "")
  ) {
    return "";
  }

  if (Number(price) === 0) {
    return t("free");
  }

  const currencySymbol = settings?.currency_symbol;
  const currencyPosition = settings?.currency_symbol_position;
  const countryCode =
    process.env.NEXT_PUBLIC_DEFAULT_COUNTRY?.toUpperCase() || "US";
  const locale = countryLocaleMap[countryCode] || "en-US";

  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(Number(price));

  return currencyPosition === "right"
    ? `${formattedNumber} ${currencySymbol}`
    : `${currencySymbol} ${formattedNumber}`;
};

export const formatSubscriptionDate = (dateString) => {
  if (!dateString) return "-";

  const countryCode =
    process.env.NEXT_PUBLIC_DEFAULT_COUNTRY?.toUpperCase() || "US";
  const locale = countryLocaleMap[countryCode] || "en-US";
  const date = new Date(dateString);

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatChatMessageTime = (dateString, langCode) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const locale = languageLocaleMap?.[langCode] || "en-US";
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDateMonthYear = (dateString, langCode) => {
  if (!dateString) return "";

  const locale = languageLocaleMap?.[langCode] || "en-US";
  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatMessageDate = (dateString, t, langCode) => {
  const messageDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return t("today");
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return t("yesterday");
  } else {
    return formatDateMonthYear(dateString, langCode);
  }
};

export const getDefaultCountryCode = (defaultCountry = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY?.toUpperCase()) => {
  try {

    if (defaultCountry) {
      return getCountryCallingCode(defaultCountry);
    }
  } catch (error) {
    console.log("Error getting country calling code:", error);
  }
  return "91"; // Fallback to "91" if env var is not set or invalid
};

export const formatPhoneNumber = (number = "", countryCode = "") => {
  if (!number || !countryCode) return number;

  // Remove non-digit characters from country code
  const countryCodeDigitsOnly = countryCode.replace(/\D/g, "");

  // Remove non-digit characters from number (optional but safer)
  const digitsOnlyNumber = number.replace(/\D/g, "");

  // Check if number starts with country code
  if (digitsOnlyNumber.startsWith(countryCodeDigitsOnly)) {
    return digitsOnlyNumber.substring(countryCodeDigitsOnly.length);
  }

  return digitsOnlyNumber;
};
