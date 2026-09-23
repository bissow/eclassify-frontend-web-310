import { cache } from "react";
import { etagFetch } from "./etagFetch";
import { SEO_REVALIDATE_SECONDS } from "@/lib/constants";

export const getSystemSettings = cache(async (langCode) => {
  try {
    // no-store freshness + ETag → cheap 304 when unchanged (see lib/etagFetch.js)
    return await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-system-settings`,
      {
        key: `settings:${langCode || "en"}`,
        headers: { "Content-Language": langCode || "en" },
      }
    );
  } catch (error) {
    console.error("Error fetching system settings:", error);
    return null;
  }
});

export const getCategoriesData = cache(async (langCode) => {
  try {
    // no-store freshness + ETag → cheap 304 when unchanged (see lib/etagFetch.js)
    const json = await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-categories?page=1`,
      {
        key: `categories:${langCode || "en"}`,
        headers: { "Content-Language": langCode || "en" },
      }
    );
    return {
      cateData: json?.data?.data || [],
      currentPage: json?.data?.current_page || 1,
      lastPage: json?.data?.last_page || 1,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { cateData: [], currentPage: 1, lastPage: 1 };
  }
});

export const getCurrentLanguageData = cache(async (langCode) => {
  try {
    const lang = langCode || "en";
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-languages?language_code=${lang}&type=web`,
      {
        next: {
          revalidate: SEO_REVALIDATE_SECONDS,
          tags: ["languages", `languages:${lang}`],
        },
      }
    );
    if (!res.ok) throw new Error(`get-languages ${res.status}`);
    const json = await res.json();
    return json?.data || null;
  } catch (error) {
    console.error("Error fetching language data:", error);
    return null;
  }
});
