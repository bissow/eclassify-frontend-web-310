import { Suspense } from "react";
import Seller from "@/features/seller/Seller";
import SellerSkeleton from "@/features/seller/SellerSkeleton";
import SellerJsonLd from "@/features/seller/SellerJsonLd";
import { getSellerData } from "@/features/seller/lib/sellerData";
import { buildSeoUrls, getLanguageCodes } from "@/lib/server/seo";

export const generateMetadata = async ({ params }) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return null;
    const { id, lang: langCode } = await params;
    const [{ seller }, langData] = await Promise.all([
      getSellerData(id, langCode),
      getLanguageCodes(),
    ]);

    const title = seller?.name;
    const image = seller?.profile;

    const { supportedLangs, defaultLangCode } = langData;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: `seller/${id}`,
    });

    return {
      title: title ? title : process.env.NEXT_PUBLIC_META_TITLE,
      description: process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: image ? [image] : [],
      },
      keywords: process.env.NEXT_PUBLIC_META_kEYWORDS,
      alternates: {
        canonical: seoUrls.canonical,
        languages: seoUrls.languages,
      },
    };
  } catch (error) {
    console.error("Error fetching MetaData:", error);
    return null;
  }
};

const SellerPage = async ({ params, searchParams }) => {
  const { id, lang: langCode } = await params;
  const { sort } = await searchParams;
  const sortBy = sort || "default";

  return (
    <>
      {/* Own boundary — the schema fetch must not delay the shell. */}
      <Suspense key={sortBy} fallback={null}>
        <SellerJsonLd id={id} langCode={langCode} sortBy={sortBy} />
      </Suspense>
      <Suspense key={id} fallback={<SellerSkeleton />}>
        <Seller id={id} langCode={langCode} sortBy={sortBy} />
      </Suspense>
    </>
  );
};

export default SellerPage;
