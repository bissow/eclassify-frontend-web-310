const baseUrl = process.env.NEXT_PUBLIC_WEB_URL;

export default function robots() {
  if (process.env.NEXT_PUBLIC_SEO !== "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
