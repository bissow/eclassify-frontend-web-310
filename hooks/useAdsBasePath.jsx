'use client'
import { useParams } from "next/navigation";

export const useAdsBasePath = () => {
    const { categorySlug, slug } = useParams();

    if (slug) return `/ads/featured/${slug}`;

    const categoryPath = categorySlug ? `/${categorySlug.join("/")}` : "";
    return `/ads${categoryPath}`;
};
