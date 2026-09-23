// Central registry of on-demand cache tags used across SEO fetches.
// Shared by the tagged `fetch` calls, /api/revalidate, and /cache-clear.
export const CACHE_TAGS = [
    { tag: "lang-codes", label: "Language Codes" },
    { tag: "languages", label: "Language Translations" },
    { tag: "seo-settings", label: "SEO Meta Settings" },
    { tag: "categories", label: "Categories" },
    { tag: "seller", label: "Seller Profiles" },
    { tag: "blogs", label: "Blogs" },
    { tag: "featured-ads", label: "Featured Ads" },
];

export const ALL_CACHE_TAGS = CACHE_TAGS.map((t) => t.tag);
