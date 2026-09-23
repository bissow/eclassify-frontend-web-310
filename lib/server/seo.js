import { SEO_REVALIDATE_SECONDS } from "@/lib/constants";

const baseUrl = process.env.NEXT_PUBLIC_WEB_URL;

export const getLanguageCodes = async ({ revalidate = SEO_REVALIDATE_SECONDS } = {}) => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-system-languages-codes`,
            {
                next: {
                    revalidate,
                    tags: ["lang-codes"],
                },
            }
        );
        const data = await res.json();

        const defaultLangCode = (
            data?.data?.default_language_code || "en"
        ).toLowerCase();

        const supportedLangs = (
            data?.data?.language_codes || []
        ).map((lng) => lng.toLowerCase());

        // ✅ Direct append (only if not already present)
        if (!supportedLangs.includes(defaultLangCode)) {
            supportedLangs.push(defaultLangCode);
        }

        return { supportedLangs, defaultLangCode };
    } catch (error) {
        console.log("error", error);
        return {
            supportedLangs: ["en"],
            defaultLangCode: "en",
        };
    }
};


export const fetchSeoData = async ({ page, langCode }) => {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}seo-settings?page=${page}`,
            {
                headers: {
                    "Content-Language": langCode || "en",
                },
                next: {
                    revalidate: SEO_REVALIDATE_SECONDS,
                    tags: ["seo-settings"],
                },
            }
        );
        // Without this an HTML error body would surface as a JSON parse error.
        if (!res.ok) throw new Error(`seo-settings ${page}: ${res.status}`);
        const data = await res.json();
        return data?.data?.[0] || null;
    } catch (error) {
        console.error("Error fetching SEO data:", error);
        return null;
    }
};

export const buildSeoUrls = ({
    supportedLangs,
    defaultLangCode,
    langCode,
    pagePath = "",
}) => {
    const normalizedLang = langCode || "en";
    const isDefault = normalizedLang === defaultLangCode;

    // default lang has no prefix in public URL
    const path = isDefault
        ? pagePath ? `/${pagePath}` : "/"
        : pagePath ? `/${normalizedLang}/${pagePath}` : `/${normalizedLang}`;

    const languages = supportedLangs.reduce((acc, lng) => {
        const isDefaultLng = lng === defaultLangCode;
        acc[lng] = isDefaultLng
            ? pagePath ? `${baseUrl}/${pagePath}` : `${baseUrl}/`
            : pagePath ? `${baseUrl}/${lng}/${pagePath}` : `${baseUrl}/${lng}`;
        return acc;
    }, {});

    return {
        path,
        canonical: `${baseUrl}${path}`,
        languages: {
            ...languages,
            "x-default": pagePath ? `${baseUrl}/${pagePath}` : `${baseUrl}/`,
        },
    };
};

export const getKeywords = (seoKeywords, fallback) => {
  if (!seoKeywords) return fallback;
  try {
    const parsed = JSON.parse(seoKeywords).map(item => item.value);
    return parsed.length ? parsed.join(", ") : fallback;
  } catch {
    return fallback;
  }
};