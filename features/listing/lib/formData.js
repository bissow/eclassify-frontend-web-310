import { isPdf } from "@/lib/media";
import { getCountryCallingCode } from "react-phone-number-input";

// Listing form-data helpers: prefill from API, and shape state into the
// custom-field / translation payload pieces consumed by buildListingPayload.

const urlToFile = async (url, filename) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

// Build the per-language `translations` state for the edit form from a listing.
export const getMainDetailsTranslations = (
  listingData,
  languages,
  defaultLangId,
  currencies = []
) => {
  const translations = {};

  // Fill translations for all languages
  languages.forEach((lang) => {
    const isDefault = lang.id === defaultLangId;

    if (isDefault) {
      const region = listingData?.region_code?.toUpperCase() || ""; // react-phone-number-input expects uppercase region code
      const countryCodeFromRegion = region ? getCountryCallingCode(region) : "";
      // Response carries the currency as a nested object; form state/update payload need a flat currency_id
      const savedCurrencyId = listingData?.currency?.id;

      // Default language gets full data
      translations[lang.id] = {
        name: listingData?.name || "",
        description: listingData?.description || "",
        price: listingData?.price || "",
        contact: listingData?.contact || "",
        video_type: listingData?.item_video?.video_type || "file",
        video_link: listingData?.item_video?.video_link || "",
        existing_product_video_url: listingData?.item_video?.video_file || null,
        product_video: null,
        slug: listingData?.slug || "",
        min_salary: listingData?.min_salary || "",
        max_salary: listingData?.max_salary || "",
        region_code: listingData?.region_code?.toLowerCase() || "",
        country_code: countryCodeFromRegion,
        item_type: listingData?.item_type || "normal",
        ...(savedCurrencyId && { currency_id: savedCurrencyId }),
      };

      // Preselect first currency if currencies are available but currency_id is not set
      // This handles the case when no currency was selected at ad listing
      if (
        !savedCurrencyId &&
        currencies?.length > 0 &&
        !translations[lang.id].currency_id
      ) {
        // Find first currency (or selected one if available)
        const defaultCurrency =
          currencies.find((curr) => curr.selected == 1) || currencies[0];

        if (defaultCurrency) {
          translations[lang.id].currency_id = defaultCurrency?.id;
        }
      }
    } else {
      // Other languages: get translation if available
      // translations is a flat array of { language_id, key, value }
      const langTranslations = (listingData?.translations || []).filter(
        (tr) => tr.language_id === lang.id
      );
      const getValue = (key) =>
        langTranslations.find((tr) => tr.key === key)?.value || "";

      translations[lang.id] = {
        name: getValue("name"),
        description: getValue("description"),
      };
    }
  });

  return translations;
};

// Build the per-language `extraDetails` state for the edit form from a listing.
export const prefillExtraDetails = ({
  data,
  languages,
  defaultLangId,
  extraFieldValue,
  setFilePreviews,
}) => {
  const tempExtraDetails = {};

  languages.forEach((lang) => {
    const isDefault = lang.id === defaultLangId;
    const perLang = {};
    data.forEach(async (field) => {
      const fieldId = field.id;

      if (!isDefault && field.type !== "textbox") return;

      const extraField = extraFieldValue.find(
        (item) => item.language_id === lang.id && item.id === fieldId
      );
      const fieldValue = extraField?.value || null;

      switch (field.type) {
        case "checkbox":
          perLang[fieldId] = fieldValue || [];
          break;

        case "radio":
          perLang[fieldId] = fieldValue ? fieldValue[0] : "";
          break;

        case "fileinput":
          if (isDefault && fieldValue) {
            const fileUrl = Array.isArray(fieldValue) ? fieldValue[0] : fieldValue;
            // update preview immediately
            setFilePreviews?.((prev) => ({
              ...prev,
              [fieldId]: {
                url: fileUrl,
                isPdf: isPdf(fileUrl),
              },
            }));

            // convert URL → File (binary) for payload
            const file = await urlToFile(fileUrl, `prefilled-${fieldId}`);
            perLang[fieldId] = file;
          } else {
            perLang[fieldId] = "";
          }
          break;

        default:
          perLang[fieldId] = fieldValue ? fieldValue[0] : "";
      }
    });

    tempExtraDetails[lang.id] = perLang;
  });

  return tempExtraDetails;
};

// Extract only non-default-language text fields (for the `translations` payload).
export const filterNonDefaultTranslations = (translations, defaultLangId) => {
  const result = {};

  // List of keys that should ONLY go into seo_details, not translations
  const seoKeys = ["meta_title", "meta_description", "meta_keywords", "schema"];

  for (const langId in translations) {
    if (Number(langId) === Number(defaultLangId)) continue;

    const fields = translations[langId];
    const filteredFields = {};

    for (const key in fields) {
      // 🚫 Skip if it's an SEO field
      if (seoKeys.includes(key)) continue;

      const value = fields[key];
      if (
        value !== undefined &&
        value !== null &&
        typeof value === "string" &&
        value.trim() !== ""
      ) {
        filteredFields[key] = value.trim();
      }
    }

    if (Object.keys(filteredFields).length > 0) {
      result[langId] = filteredFields;
    }
  }

  return JSON.stringify(result);
};

// Filter/normalize SEO entries into API-ready shape.
export const getSeoApiReadyData = (seoDetails) => {
  return seoDetails
    .filter((item) => item.meta_title || item.meta_description || item.meta_keywords || item.schema)
    .map((item) => ({
      ...item,
      meta_keywords: item.meta_keywords || "",
      schema: item.schema || "",
    }));
};
