"use client";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/common/BreadCrumb";
import { getCustomFieldsApi, getParentCategoriesApi, editItemApi, getMyItemsApi, uploadMediaApi, getMyReelsApi, getCurrenciesApi } from "@/lib/api";
import useFFmpeg from "@/features/listing/hooks/useFFmpeg";
import { useTranslation } from "@/lang/useTranslation";
import { validateListingDetails, validateListingMedia, validateSeoDetails } from "@/features/listing/lib/validation";
import { buildListingPayload, buildMediaParams } from "@/features/listing/lib/payload";
import { useWizard } from "@/features/listing/hooks/useWizard";
import { filterNonDefaultTranslations, getMainDetailsTranslations, getSeoApiReadyData, prefillExtraDetails } from "@/features/listing/lib/formData";
import EditMainDetails from "@/features/listing/edit/EditMainDetails";
import EditExtraDetails from "@/features/listing/edit/EditExtraDetails";
import EditImageUpload from "@/features/listing/edit/EditImageUpload";
import ListingLocation from "@/features/listing/shared/ListingLocation";
import MetaDetails from "@/features/listing/shared/MetaDetails";
import { toast } from "sonner";
import Checkauth from "@/features/auth/Checkauth";
import { useSelector } from "react-redux";
import AdSuccessModal from "@/features/listing/shared/AdSuccessModal";
import {
  getDefaultLanguageCode,
  getLanguages,
  getReelMaxDuration,
  getReelMaxSize,
  getVideoMaxSize,
} from "@/store/slices/settingSlice";
import AdLanguageSelector from "@/components/common/AdLanguageSelector";
import PageLoader from "@/components/common/PageLoader";
import { useParams } from "next/navigation";
import { prepareCustomFieldFiles, prepareCustomFieldTranslations, validateExtraDetails } from "@/lib/customFields";

const EditListing = () => {
  const { t } = useTranslation();
  const { lang: langCode, id } = useParams();
  const [CreatedAdSlug, setCreatedAdSlug] = useState("");
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [selectedCategoryPath, setSelectedCategoryPath] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [OtherImages, setOtherImages] = useState([]);
  const [Location, setLocation] = useState({});
  const [currencies, setCurrencies] = useState([]);
  const [filePreviews, setFilePreviews] = useState({});
  const [deleteImagesId, setDeleteImagesId] = useState([]);
  const [isAdPlaced, setIsAdPlaced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [seoDetails, setSeoDetails] = useState([]);
  const [existingReel, setExistingReel] = useState(null);
  const [videoData, setVideoData] = useState(null);
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

  const [translations, setTranslations] = useState({
    [defaultLangId]: {},
  });
  const hasTextbox = customFields.some((field) => field.type === "textbox");

  const defaultDetails = translations[defaultLangId] || {};
  const currentDetails = translations[langId] || {};
  const currentExtraDetails = extraDetails[langId] || {};
  const isReel = defaultDetails?.item_type === "reel";

  // `extra` drops out when there are no custom fields; navigation indexes into this filtered list.
  const steps = [
    { key: "details", label: t("details") },
    { key: "extra", label: t("extraDetails"), enabled: customFields?.length > 0 },
    { key: "meta", label: t("meta") },
    { key: "media", label: t("media") },
    { key: "location", label: t("location") },
  ].filter((s) => s.enabled !== false);
  const { stepIndex, isStep, goNext, goBack } = useWizard(steps);
  const handleGoBack = goBack;

  const is_job_category =
    Number(
      selectedCategoryPath[selectedCategoryPath.length - 1]?.is_job_category
    ) === 1;
  const isPriceOptional =
    Number(
      selectedCategoryPath[selectedCategoryPath.length - 1]?.price_optional
    ) === 1;

  useEffect(() => {
    getSingleListingData();
  }, [langCode]);

  const fetchCategoryPath = async (childCategoryId) => {
    try {
      const categoryResponse =
        await getParentCategoriesApi.getParentCategories({
          child_category_id: childCategoryId,
        });
      setSelectedCategoryPath(categoryResponse?.data?.data);
    } catch (error) {
      console.log("Error fetching category path:", error);
    }
  };

  const getCustomFields = async (categoryId, extraFieldValue) => {
    try {
      const customFieldsRes = await getCustomFieldsApi.getCustomFields({
        category_id: categoryId,
      });
      const data = customFieldsRes?.data?.data;
      setCustomFields(data);
      const tempExtraDetails = prefillExtraDetails({
        data,
        languages,
        defaultLangId,
        extraFieldValue,
        setFilePreviews,
      });
      setExtraDetails(tempExtraDetails);
      setLangId(defaultLangId);
    } catch (error) {
      console.log("Error fetching custom fields:", error);
    }
  };

  const getCurrencies = async () => {
    try {
      const res = await getCurrenciesApi.getCurrencies();
      const currenciesData = res?.data?.data || [];
      setCurrencies(currenciesData);
      return currenciesData;
    } catch (error) {
      console.log("error", error);
      return [];
    }
  };

  const getSingleListingData = async () => {
    try {
      setIsLoading(true);
      const res = await getMyItemsApi.getMyItems({ id: Number(id) });
      const listingData = res?.data?.data;
      if (!listingData) {
        throw new Error("Listing not found");
      }
      const [_, __, currenciesData] = await Promise.all([
        getCustomFields(
          listingData.category.id,
          listingData?.all_translated_custom_fields
        ),
        fetchCategoryPath(listingData?.category?.id),
        getCurrencies(),
      ]);

      setOtherImages(
        listingData?.gallery_images.map((img) => ({
          ...img,
          preview: img.image,
          file: { name: String(img.id ?? "img"), size: 0 },
        }))
      );

      // Default language fields live on seo_detail itself; other languages are in seo_detail.translations.
      const seoDetail = listingData?.seo_detail;
      const byLang = {};
      if (seoDetail) {
        byLang[defaultLangId] = {
          language_id: defaultLangId,
          meta_title: seoDetail.meta_title,
          meta_description: seoDetail.meta_description,
          meta_keywords: seoDetail.meta_keywords,
          schema: seoDetail.schema,
        };
      }
      (seoDetail?.translations || []).forEach(
        ({ language_id, key, value }) => {
          (byLang[language_id] ||= { language_id })[key] = value;
        }
      );
      if (Object.keys(byLang).length) setSeoDetails(Object.values(byLang));

      const mainDetailsTranslation = getMainDetailsTranslations(
        listingData,
        languages,
        defaultLangId,
        currenciesData
      );
      setTranslations(mainDetailsTranslation);

      if (listingData.item_type === "reel") {
        const reelRes = await getMyReelsApi.getMyReels({ item_id: listingData.id });
        if (reelRes?.data?.error === false) {
          setExistingReel(reelRes?.data?.data?.data?.[0] ?? null);
        }
      }

      setLocation({
        country: listingData?.country,
        state: listingData?.state,
        city: listingData?.city,
        formattedAddress:
          listingData?.translation?.address || listingData?.address,
        lat: listingData?.latitude,
        long: listingData?.longitude,
        area_id: listingData?.area_id ? listingData?.area_id : null,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateDetailsStep = () =>
    validateListingDetails({ defaultDetails, is_job_category, isPriceOptional, t });

  const validateImagesStep = () =>
    validateListingMedia({
      defaultDetails,
      videoData,
      otherImages: OtherImages,
      videoMaxSize,
      reelMaxDuration,
      reelMaxSize,
      isReel,
      t,
    });

  const handleDetailsSubmit = () => {
    if (!validateDetailsStep()) return;
    goNext();
  };

  const submitExtraDetails = () => {
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

  const handleImageSubmit = () => {
    if (!validateImagesStep()) return;
    goNext();
  };

  const editAd = async () => {
    if (
      !Location?.country ||
      !Location?.state ||
      !Location?.city ||
      !Location?.formattedAddress
    ) {
      toast.error(t("pleaseSelectCity"));
      return;
    }

    const nonDefaultTranslations = filterNonDefaultTranslations(
      translations,
      defaultLangId
    );
    const customFieldTranslations =
      prepareCustomFieldTranslations(extraDetails);

    const customFieldFiles = prepareCustomFieldFiles(
      extraDetails,
      defaultLangId
    );

    const seo_details = getSeoApiReadyData(seoDetails);

    const allData = buildListingPayload({
      mode: "edit",
      defaultDetails,
      location: Location,
      galleryImages: OtherImages.map((img) => img?.file || img?.image),
      itemId: id,
      is_job_category,
      nonDefaultTranslations,
      customFieldTranslations,
      customFieldFiles,
      seoDetails: seo_details,
      deleteImagesId,
    });

    try {
      setIsAdPlaced(true);
      const res = await editItemApi.editItem(allData);
      if (res?.data?.error === false) {
        const itemId = res?.data?.data?.id;
        const mediaParams = await buildMediaParams({
          videoData,
          defaultDetails,
          itemId,
          includeReel: isReel,
        });
        if (mediaParams) {
          const mediaRes = await uploadMediaApi.uploadMedia(mediaParams);
          if (mediaRes?.data?.error === true) {
            toast.error(mediaRes?.data?.message || t("somethingWentWrong"));
            return;
          }
        }
        setOpenSuccessModal(true);
        setCreatedAdSlug(res?.data?.data?.slug);
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsAdPlaced(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <PageLoader />
      ) : (
        <>
          <BreadCrumb items={[{ name: t("editListing") }]} />
          <div className="container">
            <div className="flex flex-col gap-6 mt-8">

              <div className="flex items-center gap-3 justify-between">
                <h1 className="hidden sm:block text-2xl font-medium">{t("editListing")}</h1>

                <h1 className="text-2xl font-medium sm:hidden">
                  {isStep("details")
                    ? t("editDetails")
                    : isStep("extra")
                      ? t("editExtraDetails")
                      : isStep("meta")
                        ? t("meta")
                        : isStep("media")
                          ? t("editImages")
                          : isStep("location")
                            ? t("editLocation")
                            : t("editListing")}
                </h1>

                <div className="sm:hidden">
                  {(isStep("details") || (isStep("extra") && hasTextbox) || isStep("media")) && (
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
                <div className="hidden sm:flex items-center gap-3 justify-between bg-muted px-4 py-2 rounded-md flex-wrap">
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
                {isStep("details") &&
                  selectedCategoryPath?.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <h1 className="font-medium text-muted-foreground sm:text-black text-sm sm:text-xl">
                        {t("selectedCategory")}
                      </h1>
                      <div className="flex">
                        {selectedCategoryPath?.map((item, index) => {
                          const shouldShowComma =
                            selectedCategoryPath.length > 1 &&
                            index !== selectedCategoryPath.length - 1;
                          return (
                            <span className="text-primary" key={item.id}>
                              {item.name}
                              {shouldShowComma && ", "}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                <div>
                  {isStep("details") && (
                    <EditMainDetails
                      setTranslations={setTranslations}
                      current={currentDetails}
                      langId={langId}
                      defaultLangId={defaultLangId}
                      handleDetailsSubmit={handleDetailsSubmit}
                      is_job_category={is_job_category}
                      isPriceOptional={isPriceOptional}
                      currencies={currencies}
                    />
                  )}

                  {isStep("extra") && (
                    <EditExtraDetails
                      customFields={customFields}
                      extraDetails={extraDetails}
                      setExtraDetails={setExtraDetails}
                      handleGoBack={handleGoBack}
                      filePreviews={filePreviews}
                      setFilePreviews={setFilePreviews}
                      submitExtraDetails={submitExtraDetails}
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
                    <EditImageUpload
                      OtherImages={OtherImages}
                      setOtherImages={setOtherImages}
                      handleImageSubmit={handleImageSubmit}
                      handleGoBack={handleGoBack}
                      setDeleteImagesId={setDeleteImagesId}
                      isReel={isReel}
                      existingReel={existingReel}
                      videoData={videoData}
                      setVideoData={setVideoData}
                      defaultDetails={defaultDetails}
                      setTranslations={setTranslations}
                      defaultLangId={defaultLangId}
                      trimVideo={trimVideo}
                    />
                  )}

                  {isStep("location") && (
                    <ListingLocation
                      title={t("editLocation")}
                      handleGoBack={handleGoBack}
                      location={Location}
                      setLocation={setLocation}
                      onSubmit={editAd}
                      isAdPlaced={isAdPlaced}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <AdSuccessModal
            openSuccessModal={openSuccessModal}
            setOpenSuccessModal={setOpenSuccessModal}
            createdAdSlug={CreatedAdSlug}
          />
        </>
      )}
    </>
  );
};

export default Checkauth(EditListing);
