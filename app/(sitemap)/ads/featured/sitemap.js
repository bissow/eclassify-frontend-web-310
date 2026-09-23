import { SITEMAP_REVALIDATE_SECONDS } from "@/lib/constants";
import { getLanguageCodes } from "@/lib/server/seo";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const baseUrl = process.env.NEXT_PUBLIC_WEB_URL;
const endpoint = process.env.NEXT_PUBLIC_END_POINT;

export default async function sitemap() {
  if (process.env.NEXT_PUBLIC_SEO !== "true") return [];

  const { supportedLangs, defaultLangCode } = await getLanguageCodes({ revalidate: SITEMAP_REVALIDATE_SECONDS });

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

  try {
    const res = await fetch(
      `${apiUrl}${endpoint}get-featured-section-slug`,
      { next: { revalidate: SITEMAP_REVALIDATE_SECONDS } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const sections = json?.data?.data || [];

    return sections.flatMap((section) => {
      const path = `/ads/featured/${section?.slug}`;
      if (!section?.slug) return [];
      return supportedLangs.map((lang) => ({
        url: buildUrlForLang(lang, path),
        lastModified: section?.updated_at ? new Date(section.updated_at).toISOString() : new Date().toISOString(),
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: buildHreflangLinks(path),
      }));
    });
  } catch {
    return [];
  }
}
