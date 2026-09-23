"use client";
import { useEffect, useState } from "react";
import CategorySelectToListAd from "@/features/listing/create/CategorySelectToListAd";
import { categoryApi, getCustomFieldsApi, addItemApi, uploadMediaApi, getCurrenciesApi } from "@/lib/api";
import useFFmpeg from "@/features/listing/hooks/useFFmpeg";
import { useTranslation } from "@/lang/useTranslation";
import { getDefaultCountryCode } from "@/lib/format";
import { toast } from "sonner";
import ExtraDetails from "@/features/listing/create/ExtraDetails";
import ImageUpload from "@/features/listing/shared/ImageUpload";
import ListingLocation from "@/features/listing/shared/ListingLocation";
import { useSelector } from "react-redux";
import AdSuccessModal from "@/features/listing/shared/AdSuccessModal";
import BreadCrumb from "@/components/common/BreadCrumb";
import Checkauth from "@/features/auth/Checkauth";
import AdLanguageSelector from "@/components/common/AdLanguageSelector";
import {
  getDefaultLanguageCode,
  getLanguages,
  getReelMaxDuration,
  getReelMaxSize,
  getVideoMaxSize,
} from "@/store/slices/settingSlice";
import { userSignUpData } from "@/store/slices/authSlice";
import { getCityDataClient } from "@/lib/location";
import PackageRequiredModal from "@/components/common/PackageRequiredModal";
import { useParams, useSearchParams } from "next/navigation";
import MainDetails from "@/features/listing/create/MainDetails";
import MetaDetails from "@/features/listing/shared/MetaDetails";
import { validateListingDetails, validateListingMedia, validateSeoDetails } from "@/features/listing/lib/validation";
import { buildListingPayload, buildMediaParams } from "@/features/listing/lib/payload";
import { useWizard } from "@/features/listing/hooks/useWizard";
import { filterNonDefaultTranslations, getSeoApiReadyData } from "@/features/listing/lib/formData";
import { prepareCustomFieldFiles, prepareCustomFieldTranslations, validateExtraDetails } from "@/lib/customFields";

const AdsListing = () => {
  const { t } = useTranslation();
  const { lang: langCode } = useParams();
  const searchParams = useSearchParams();
  const itemType = searchParams.get("type");
  const [categories, setCategories] = useState();
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isLoadMoreCat, setIsLoadMoreCat] = useState(false);
  const [categoryPath, setCategoryPath] = useState([]);
  const [currentPage, setCurrentPage] = useState();
  const [lastPage, setLastPage] = useState();
  const [customFields, setCustomFields] = useState([]);
  const [filePreviews, setFilePreviews] = useState({});
  const [otherImages, setOtherImages] = useState([]);
  const [videoData, setVideoData] = useState(null);
  const [location, setLocation] = useState({});
  const [currencies, setCurrencies] = useState([]);
  const [isAdPlaced, setIsAdPlaced] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [createdAdSlug, setCreatedAdSlug] = useState("");
  const userData = useSelector(userSignUpData);
  const [packageModalCategory, setPackageModalCategory] = useState(null);
  const [seoDetails, setSeoDetails] = useState([]);

  const { trimVideo } = useFFmpeg();
  const reelMaxDuration = useSelector(getReelMaxDuration);
  const reelMaxSize = useSelector(getReelMaxSize);
  const videoMaxSize = useSelector(getVideoMaxSize);
  const languages = useSelector(getLanguages);
  const defaultLanguageCode = useSelector(getDefaultLanguageCode);

  const defaultLangId = languages?.find(
    (lang) => lang.code === defaultLanguageCode
  )?.id;

  const [extraDetails, setExtraDetails] = useState({
    [defaultLangId]: {},
  });
  const [langId, setLangId] = useState(defaultLangId);

  const countryCode =
    userData?.country_code?.replace("+", "") || getDefaultCountryCode();
  const mobile = userData?.mobile || "";
  const regionCode =
    userData?.region_code?.toLowerCase() ||
    process.env.NEXT_PUBLIC_DEFAULT_COUNTRY?.toLowerCase() ||
    "in";

  const [translations, setTranslations] = useState({
    [langId]: {
      contact: mobile,
      country_code: countryCode,
      region_code: regionCode,
      video_type: "file",
      video_link: "",
      product_video: null,
    },
  });
  const hasTextbox = customFields.some((field) => field.type === "textbox");

  const defaultDetails = translations[defaultLangId] || {};
  const currentDetails = translations[langId] || {};
  const currentExtraDetails = extraDetails[langId] || {};

  // Ordered wizard steps; `extra` drops out when there are no custom fields.
  // Navigation is by index into this filtered list — no hardcoded step numbers.
  const steps = [
    { key: "category", label: t("selectedCategory") },
    { key: "details", label: t("details") },
    { key: "extra", label: t("extraDetails"), enabled: customFields?.length > 0 },
    { key: "meta", label: t("meta") },
    { key: "media", label: t("media") },
    { key: "location", label: t("location") },
  ].filter((s) => s.enabled !== false);
  const { stepIndex, isStep, goNext, goBack, goTo } = useWizard(steps);
  const handleGoBack = goBack;

  const is_job_category =
    Number(categoryPath[categoryPath.length - 1]?.is_job_category) === 1;
  const isPriceOptional =
    Number(categoryPath[categoryPath.length - 1]?.price_optional) === 1;

  let lastItemId = categoryPath[categoryPath.length - 1]?.id;

  useEffect(() => {
    if (stepIndex === 0) {
      handleFetchCategories();
    }
  }, [langCode]);

  useEffect(() => {
    if (stepIndex !== 0 && lastItemId) {
      getCustomFieldsData();
    }
  }, [lastItemId, langCode]);

  useEffect(() => {
    getCurrencies();
  }, [countryCode]);

  const getCurrencies = async () => {
    try {
      let params = {};

      const currentCountry = getCityDataClient()?.country;
      if (currentCountry) {
        params.country = currentCountry;
      }
      const res = await getCurrenciesApi.getCurrencies(params);
      const currenciesData = res?.data?.data || [];
      setCurrencies(currenciesData);
      // 🚫 IMPORTANT: If no currencies, REMOVE currency_id
      if (currenciesData.length === 0) {
        setTranslations((prev) => {
          const updated = { ...prev };

          if (updated[langId]?.currency_id) {
            delete updated[langId].currency_id;
          }

          return updated;
        });
        return;
      }
      // ✅ Normal case: set default currency
      const defaultCurrency =
        currenciesData.find((c) => c.selected == 1) || currenciesData[0];

      if (defaultCurrency && !translations[langId]?.currency_id) {
        setTranslations((prev) => ({
          ...prev,
          [langId]: {
            ...prev[langId],
            currency_id: defaultCurrency.id,
          },
        }));
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleFetchCategories = async (
    category,
    isWaitForApiResToUpdatePath = false
  ) => {
    setCategoriesLoading(true);
    try {
      const categoryId = category ? category?.id : null;

      const res = await categoryApi.getCategory({
        category_id: categoryId,
      });
      if (res?.data?.error === false) {
        const data = res?.data?.data?.data;
        setCategories(data);
        setCurrentPage(res?.data?.data?.current_page);
        setLastPage(res?.data?.data?.last_page);
        if (isWaitForApiResToUpdatePath) {
          setCategoryPath((prevPath) => [...prevPath, category]);
          if (category.subcategories_count == 0) {
            goNext();
          }
        } else {
          const index = categoryPath.findIndex(
            (item) => item.id === category?.id
          );
          setCategoryPath((prevPath) => prevPath.slice(0, index + 1));
        }
      } else {
        if (res?.data?.code === 103) {
          setPackageModalCategory(category);
          return
        }
        toast.error(res?.data?.message)
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const getCustomFieldsData = async () => {
    try {
      const res = await getCustomFieldsApi.getCustomFields({
        category_id: lastItemId,
      });
      const data = res?.data?.data;
      setCustomFields(data);

      const initializedDetails = {};

      languages.forEach((lang) => {
        const langFields = {};

        data.forEach((item) => {
          if (lang.id !== defaultLangId && item.type !== "textbox") return;

          let initialValue = "";
          switch (item.type) {
            case "checkbox":
            case "radio":
              initialValue = [];
              break;
            case "fileinput":
              initialValue = null;
              break;
            case "dropdown":
            case "textbox":
            case "number":
            case "text":
              initialValue = "";
              break;
            default:
              break;
          }
          langFields[item.id] = initialValue;
        });
        initializedDetails[lang.id] = langFields;
      });
      setExtraDetails(initializedDetails);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCategoryTabClick = async (category) => {
    const reelBlocked = itemType === "video" && !category?.is_reel_allowed_in_listing;
    const listingBlocked = itemType !== "video" && !category?.is_listing_available;
    if (reelBlocked || listingBlocked) {
      setPackageModalCategory({ ...category, reelBlocked });
      return;
    }
    await handleFetchCategories(category, true);
  };

  const handleSelectedTabClick = (id) => {
    setCustomFields([]);
    setLangId(defaultLangId);
    setTranslations({
      [defaultLangId]: {
        contact: mobile,
        country_code: countryCode,
        region_code: regionCode,
        currency_id: translations[defaultLangId]?.currency_id,
      },
    });
    setExtraDetails({
      [defaultLangId]: {},
    });
    if (stepIndex !== 0) {
      goTo(0);
    }
    // ✅ SINGLE CATEGORY EDGE CASE

    const index = categoryPath.findIndex((item) => item.id === id);

    if (index === 0) {
      setCategoryPath([]);
      // Fetch root / all categories
      handleFetchCategories(null);
      return;
    }

    // ✅ NORMAL BACK-NAVIGATION FLOW
    const secondLast = categoryPath[index - 1];

    if (secondLast) {
      handleFetchCategories(secondLast);
    }
  };

  const validateDetailsStep = () =>
    validateListingDetails({ defaultDetails, is_job_category, isPriceOptional, t });

  const validateImagesStep = () =>
    validateListingMedia({
      defaultDetails,
      videoData,
      otherImages,
      videoMaxSize,
      reelMaxDuration,
      reelMaxSize,
      isReel: itemType === "video",
      t,
    });

  const handleDetailsSubmit = () => {
    if (!validateDetailsStep()) return;
    goNext();
  };

  const handleExtraDetailsSubmit = () => {
    if (
      customFields.length !== 0 &&
      !validateExtraDetails({
        languages,
        defaultLangId,
        extraDetails,
        customFields,
        filePreviews,
        t,
      })
    ) {
      return;
    }
    goNext();
  };

  const handleMetaDetailsSubmit = () => {
    if (!validateSeoDetails(seoDetails, languages, defaultLangId, t)) return;
    goNext();
  };

  const handleImagesSubmit = () => {
    if (!validateImagesStep()) return;
    goNext();
  };

  const postAd = async () => {
    if (
      !location?.country ||
      !location?.state ||
      !location?.city ||
      !location?.formattedAddress
    ) {
      toast.error(t("pleaseSelectCity"));
      return;
    }

    const customFieldTranslations =
      prepareCustomFieldTranslations(extraDetails);

    const customFieldFiles = prepareCustomFieldFiles(
      extraDetails,
      defaultLangId
    );
    const nonDefaultTranslations = filterNonDefaultTranslations(
      translations,
      defaultLangId
    );

    const seo_details = getSeoApiReadyData(seoDetails);

    const allData = buildListingPayload({
      mode: "create",
      defaultDetails,
      location,
      galleryImages: otherImages.map((imgObj) => imgObj.file),
      categoryId: lastItemId,
      is_job_category,
      itemType,
      nonDefaultTranslations,
      customFieldTranslations,
      customFieldFiles,
      seoDetails: seo_details,
    });

    try {
      setIsAdPlaced(true);
      const res = await addItemApi.addItem(allData);
      if (res?.data?.error === false) {
        const itemId = res?.data?.data?.id;
        const slug = res?.data?.data?.slug;

        const mediaParams = await buildMediaParams({
          videoData,
          defaultDetails,
          itemId,
          includeReel: true,
        });
        if (mediaParams) {
          const mediaRes = await uploadMediaApi.uploadMedia(mediaParams);
          if (mediaRes?.data?.error === true) {
            toast.error(mediaRes?.data?.message || t("somethingWentWrong"));
            return;
          }
        }
        setOpenSuccessModal(true);
        setCreatedAdSlug(slug);
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdPlaced(false);
    }
  };

  const fetchMoreCategory = async () => {
    setIsLoadMoreCat(true);
    try {
      const response = await categoryApi.getCategory({
        page: `${currentPage + 1}`,
        category_id: lastItemId,
      });
      const { data } = response.data;
      setCategories((prev) => [...prev, ...data.data]);
      setCurrentPage(data?.current_page); // Update the current page
      setLastPage(data?.last_page); // Update the current page
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoadMoreCat(false);
    }
  };

  const handleDeatilsBack = () => {
    handleSelectedTabClick(categoryPath.at(-1)?.id);
  };


  return (
    <>
      <BreadCrumb items={[{ name: t("adListing") }]} />
      <div className="container">
        <div className="flex flex-col gap-8 mt-8">

          <div className="flex items-center gap-3 justify-between">
            <h1 className="hidden sm:block text-2xl font-medium">{t("adListing")}</h1>

            {/* mobile only label */}
            <h1 className="text-2xl font-medium sm:hidden">
              {isStep("details")
                ? t("addDetails")
                : isStep("extra")
                  ? t("addExtraDetails")
                  : isStep("meta")
                    ? t("meta")
                    : isStep("media")
                      ? t("addImages")
                      : isStep("location")
                        ? t("addLocation")
                        : t("adListing")}
            </h1>

            {/* Mobile-only selector */}
            <div className="sm:hidden">
              {(isStep("details") || (isStep("extra") && hasTextbox) || isStep("meta")) && (
                <AdLanguageSelector
                  langId={langId}
                  setLangId={setLangId}
                  languages={languages}
                  setTranslations={setTranslations}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6 sm:border rounded-md sm:p-4">
            <div className="hidden sm:flex items-center gap-3 justify-between bg-muted px-4 sm:py-2 rounded-md flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                {steps.map((s, i) => (
                  <div
                    key={s.key}
                    className={`transition-all duration-300 p-2 rounded-md ${i === stepIndex ? "bg-primary text-white" : ""
                      }`}
                  >
                    {s.label}
                  </div>
                ))}
              </div>

              {(isStep("details") || (isStep("extra") && hasTextbox) || isStep("meta")) && (
                <AdLanguageSelector
                  langId={langId}
                  setLangId={setLangId}
                  languages={languages}
                  setTranslations={setTranslations}
                />
              )}
            </div>

            {(isStep("category") || isStep("details")) &&
              (
                categoryPath?.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="font-medium text-muted-foreground sm:text-black text-sm sm:text-xl">{t("selectedCategory")}</p>
                    <div className="flex">
                      {categoryPath?.map((item, index) => {
                        const shouldShowComma =
                          categoryPath.length > 1 &&
                          index !== categoryPath.length - 1;
                        return (
                          <button
                            key={item.id}
                            className="text-primary ltr:text-left rtl:text-right"
                            onClick={() => handleSelectedTabClick(item?.id)}
                            disabled={categoriesLoading}
                          >
                            {item.translated_name || item.name}
                            {shouldShowComma && ", "}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) :
                  (
                    // mobile only label
                    <p className="block sm:hidden font-medium text-muted-foreground text-sm -mb-6">{t("selectTheCategory")}</p>
                  )
              )
            }
            <div>
              {isStep("category") && (
                <CategorySelectToListAd
                  categories={categories}
                  setCategoryPath={setCategoryPath}
                  fetchMoreCategory={fetchMoreCategory}
                  lastPage={lastPage}
                  currentPage={currentPage}
                  isLoadMoreCat={isLoadMoreCat}
                  handleCategoryTabClick={handleCategoryTabClick}
                  categoriesLoading={categoriesLoading}
                />
              )}

              {isStep("details") && (
                <MainDetails
                  currencies={currencies}
                  setTranslations={setTranslations}
                  current={currentDetails}
                  langId={langId}
                  defaultLangId={defaultLangId}
                  handleDetailsSubmit={handleDetailsSubmit}
                  is_job_category={is_job_category}
                  isPriceOptional={isPriceOptional}
                  handleDeatilsBack={handleDeatilsBack}
                />
              )}

              {isStep("extra") && (
                <ExtraDetails
                  customFields={customFields}
                  setExtraDetails={setExtraDetails}
                  filePreviews={filePreviews}
                  setFilePreviews={setFilePreviews}
                  onNext={handleExtraDetailsSubmit}
                  handleGoBack={handleGoBack}
                  currentExtraDetails={currentExtraDetails}
                  langId={langId}
                  defaultLangId={defaultLangId}
                />
              )}

              {isStep("meta") && (
                <MetaDetails
                  seoDetails={seoDetails}
                  setSeoDetails={setSeoDetails}
                  langId={langId}
                  onNext={handleMetaDetailsSubmit}
                  handleGoBack={handleGoBack}
                  adTitle={currentDetails.name}
                  adPrice={defaultDetails.price}
                  currencyIsoCode={currencies.find(c => c.id === defaultDetails.currency_id)?.iso_code}
                />
              )}

              {isStep("media") && (
                <ImageUpload
                  otherImages={otherImages}
                  setOtherImages={setOtherImages}
                  videoData={videoData}
                  setVideoData={setVideoData}
                  onNext={handleImagesSubmit}
                  handleGoBack={handleGoBack}
                  defaultDetails={defaultDetails}
                  setTranslations={setTranslations}
                  defaultLangId={defaultLangId}
                  trimVideo={trimVideo}
                />
              )}

              {isStep("location") && (
                <ListingLocation
                  location={location}
                  setLocation={setLocation}
                  onSubmit={postAd}
                  isAdPlaced={isAdPlaced}
                  handleGoBack={handleGoBack}
                />
              )}
            </div>
          </div>
        </div>
        <AdSuccessModal
          openSuccessModal={openSuccessModal}
          setOpenSuccessModal={setOpenSuccessModal}
          createdAdSlug={createdAdSlug}
        />
        <PackageRequiredModal
          open={!!packageModalCategory}
          onClose={() => setPackageModalCategory(null)}
          categoryId={packageModalCategory?.id}
          customMessage={packageModalCategory?.reelBlocked
            ? `${t("reelsAreNotAllowedIn")} ${packageModalCategory?.translated_name}`
            : `${t("subscribeToPackageFor")} ${packageModalCategory?.translated_name}`}
        />
      </div>
    </>
  );
};

export default Checkauth(AdsListing);
