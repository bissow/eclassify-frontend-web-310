import { SITEMAP_REVALIDATE_SECONDS } from "@/lib/constants";
import { getLanguageCodes } from "@/lib/server/seo";

export default async function sitemap() {
  if (process.env.NEXT_PUBLIC_SEO !== "true") return [];

  const baseUrl = process.env.NEXT_PUBLIC_WEB_URL;

  const { supportedLangs, defaultLangCode } = await getLanguageCodes({ revalidate: SITEMAP_REVALIDATE_SECONDS });

  const publicRoutes = [
    "about-us",
    "ads",
    "blogs",
    "contact-us",
    "faqs",
    "landing",
    "privacy-policy",
    "refund-policy",
    "subscription",
    "terms-and-condition",
  ];

  const buildUrlForLang = (lang, path) => {
    if (lang === defaultLangCode) return `${baseUrl}${path}`;
    return `${baseUrl}/${lang}${path}`;
  };

  const buildHreflangLinks = (path) => {
    const links = {};
    supportedLangs.forEach((lang) => {
      links[lang] = buildUrlForLang(lang, path);
    });
    links["x-default"] = buildUrlForLang(defaultLangCode, path);
    return { languages: links };
  };

  const homeEntries = supportedLangs.map((lang) => ({
    url: buildUrlForLang(lang, ""),
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly",
    priority: lang === defaultLangCode ? 1 : 0.9,
    alternates: buildHreflangLinks(""),
  }));

  const staticSitemapEntries = supportedLangs.flatMap((lang) =>
    publicRoutes.map((route) => {
      const path = `/${route}`;
      return {
        url: buildUrlForLang(lang, path),
        lastModified: new Date().toISOString(),
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: buildHreflangLinks(path),
      };
    })
  );

  return [
    ...homeEntries,
    ...staticSitemapEntries,
  ];
}
