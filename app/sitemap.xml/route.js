import { SITEMAP_REVALIDATE_SECONDS } from "@/lib/constants";

const baseUrl = process.env.NEXT_PUBLIC_WEB_URL;
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const endpoint = process.env.NEXT_PUBLIC_END_POINT;

async function fetchCategoryLastPage() {
  try {
    const res = await fetch(
      `${apiUrl}${endpoint}get-categories-slug?page=1`,
      { next: { revalidate: SITEMAP_REVALIDATE_SECONDS } }
    );
    if (!res.ok) return 1;
    const json = await res.json();
    return json?.data?.last_page || 1;
  } catch {
    return 1;
  }
}

async function fetchAdsLastPage() {
  try {
    const res = await fetch(
      `${apiUrl}${endpoint}get-item-slug?page=1`,
      { next: { revalidate: SITEMAP_REVALIDATE_SECONDS } }
    );
    if (!res.ok) return 1;
    const json = await res.json();
    return json?.data?.last_page || 1;
  } catch {
    return 1;
  }
}

async function fetchBlogsLastPage() {
  try {
    const res = await fetch(
      `${apiUrl}${endpoint}get-blogs-slug?page=1`,
      { next: { revalidate: SITEMAP_REVALIDATE_SECONDS } }
    );
    if (!res.ok) return 1;
    const json = await res.json();
    return json?.data?.last_page || 1;
  } catch {
    return 1;
  }
}

async function fetchSellerLastPage() {
  try {
    const res = await fetch(
      `${apiUrl}${endpoint}get-seller-slug?page=1`,
      { next: { revalidate: SITEMAP_REVALIDATE_SECONDS } }
    );
    if (!res.ok) return 1;
    const json = await res.json();
    return json?.data?.last_page || 1;
  } catch {
    return 1;
  }
}

export async function GET() {
  if (process.env.NEXT_PUBLIC_SEO !== "true") {
    return new Response("", { status: 404 });
  }

  const lastmod = new Date().toISOString();

  const [categoryLastPage, adsLastPage, sellerLastPage, blogsLastPage] = await Promise.all([
    fetchCategoryLastPage(),
    fetchAdsLastPage(),
    fetchSellerLastPage(),
    fetchBlogsLastPage(),
  ]);

  const categorySitemapEntries = Array.from({ length: categoryLastPage }, (_, i) =>
    `  <sitemap>\n    <loc>${baseUrl}/categories/sitemap/${i}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
  ).join("\n");

  const adsSitemapEntries = Array.from({ length: adsLastPage }, (_, i) =>
    `  <sitemap>\n    <loc>${baseUrl}/ads/sitemap/${i}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
  ).join("\n");

  const blogsSitemapEntries = Array.from({ length: blogsLastPage }, (_, i) =>
    `  <sitemap>\n    <loc>${baseUrl}/blogs/sitemap/${i}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
  ).join("\n");

  const sellerSitemapEntries = Array.from({ length: sellerLastPage }, (_, i) =>
    `  <sitemap>\n    <loc>${baseUrl}/seller/sitemap/${i}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/main/sitemap.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
${categorySitemapEntries}
${adsSitemapEntries}
${sellerSitemapEntries}
${blogsSitemapEntries}
  <sitemap>
    <loc>${baseUrl}/ads/featured/sitemap.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
