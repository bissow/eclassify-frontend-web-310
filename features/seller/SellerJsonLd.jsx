import StructuredData from "@/components/layout/StructuredData";
import { getSellerItems } from "@/features/seller/lib/sellerData";

// Own Suspense boundary so the ItemList schema fetch never delays the page
// shell. Shares the cache()d request with SellerListingsSection.
const SellerJsonLd = async ({ id, langCode, sortBy }) => {
  if (process.env.NEXT_PUBLIC_SEO === "false") return null;

  const items = await getSellerItems({ id, langCode, sortBy });
  const sellerItems = items?.data || [];
  if (!sellerItems.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: sellerItems.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        productID: product?.id,
        name: product?.translation?.name,
        description: product?.translation?.description,
        image: product?.image,
        url: `${process.env.NEXT_PUBLIC_WEB_URL}/ad-details/${product?.slug}`,
        category: {
          "@type": "Thing",
          name: product?.category?.translated_name,
        },
        offers: {
          "@type": "Offer",
          price: product?.price,
          priceCurrency: "USD",
        },
        countryOfOrigin: product?.country,
      },
    })),
  };

  return <StructuredData data={jsonLd} />;
};

export default SellerJsonLd;
