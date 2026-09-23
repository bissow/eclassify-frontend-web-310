import { SITEMAP_REVALIDATE_SECONDS } from "@/lib/constants";
import { getLanguageCodes } from "@/lib/server/seo";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const baseUrl = process.env.NEXT_PUBLIC_WEB_URL;
const endpoint = process.env.NEXT_PUBLIC_END_POINT;

export async function generateSitemaps() {
  if (process.env.NEXT_PUBLIC_SEO !== "true") return [];

  try {
    const res = await fetch(
      `${apiUrl}${endpoint}get-blogs-slug?page=1`,
      { next: { revalidate: SITEMAP_REVALIDATE_SECONDS } }
    );
    if (!res.ok) return [{ id: 0 }];
    const json = await res.json();
    const lastPage = json?.data?.last_page || 1;
    return Array.from({ length: lastPage }, (_, i) => ({ id: i }));
  } catch {
    return [{ id: 0 }];
  }
}

export default async function sitemap(props) {
  if (process.env.NEXT_PUBLIC_SEO !== "true") return [];

  const id = await props.id;
  const page = Number(id) + 1;

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
      `${apiUrl}${endpoint}get-blogs-slug?page=${page}`,
      { next: { revalidate: SITEMAP_REVALIDATE_SECONDS } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const blogs = json?.data?.data || [];

    return blogs.flatMap((blog) => {
      const path = `/blogs/${blog?.slug}`;
      if (!blog?.slug) return [];
      return supportedLangs.map((lang) => ({
        url: buildUrlForLang(lang, path),
        lastModified: blog?.updated_at ? new Date(blog.updated_at).toISOString() : new Date().toISOString(),
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: buildHreflangLinks(path),
      }));
    });
  } catch {
    return [];
  }
}
