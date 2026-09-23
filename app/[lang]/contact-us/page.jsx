import ContactUs from "@/features/contact/ContactUs";
import { buildSeoUrls, fetchSeoData, getLanguageCodes } from "@/lib/server/seo";
import StructuredData from "@/components/layout/StructuredData";

export const dynamic = "force-dynamic";

export const generateMetadata = async ({ params }) => {
  try {
    if (process.env.NEXT_PUBLIC_SEO === "false") return null;
    const { lang: langCode } = await params;

    const [contactUs, langData] = await Promise.all([
      fetchSeoData({
        page: "contact-us",
        langCode,
      }),
      getLanguageCodes(),
    ]);

    const { supportedLangs, defaultLangCode } = langData;

    const seoUrls = buildSeoUrls({
      supportedLangs,
      defaultLangCode,
      langCode,
      pagePath: "contact-us",
    });

    return {
      title: contactUs?.translated_title || process.env.NEXT_PUBLIC_META_TITLE,
      description:
        contactUs?.translated_description ||
        process.env.NEXT_PUBLIC_META_DESCRIPTION,
      openGraph: {
        images: contactUs?.image ? [contactUs?.image] : [],
      },
      keywords:
        contactUs?.translated_keywords || process.env.NEXT_PUBLIC_META_kEYWORDS,
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

const ContactUsPage = async ({ params }) => {
  const { lang: langCode } = await params;
  const contactUs = await fetchSeoData({ page: "contact-us", langCode });

  let schema = null;
  if (contactUs?.translated_schema) {
    try {
      schema = JSON.parse(contactUs.translated_schema);
    } catch (e) {
      console.error("Invalid JSON for contact-us schema:", e);
    }
  }

  return (
    <>
      <StructuredData data={schema} />
      <ContactUs />
    </>
  );
};

export default ContactUsPage;
