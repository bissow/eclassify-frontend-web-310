import { VIDEO_LINK_VALIDATORS } from "@/features/listing/lib/validation";

// Builds the add-item / update-item request body.
// Shared shape lives in `base`; create vs edit differ only in a few keys.
export const buildListingPayload = ({
  mode, // "create" | "edit"
  defaultDetails,
  location,
  galleryImages, // already-mapped array of File/url
  categoryId, // create
  itemId, // edit
  is_job_category,
  itemType, // create ("video" -> reel)
  nonDefaultTranslations,
  customFieldTranslations,
  customFieldFiles,
  seoDetails, // getSeoApiReadyData() output
  deleteImagesId, // edit
}) => {
  const base = {
    name: defaultDetails.name,
    slug: defaultDetails.slug.trim(),
    description: defaultDetails?.description,
    price: defaultDetails.price,
    contact: defaultDetails.contact,
    region_code: defaultDetails?.region_code?.toUpperCase() || "",
    video_type: defaultDetails.video_type || "file",
    ...(VIDEO_LINK_VALIDATORS[defaultDetails.video_type] &&
    defaultDetails.video_link
      ? { video_link: defaultDetails.video_link }
      : {}),
    gallery_images: galleryImages,
    address: location?.formattedAddress,
    latitude: location?.lat,
    longitude: location?.long,
    custom_field_files: customFieldFiles,
    country: location?.country,
    state: location?.state,
    city: location?.city,
    ...(location?.area_id ? { area_id: Number(location?.area_id) } : {}),
    ...(Object.keys(nonDefaultTranslations).length > 0 && {
      translations: nonDefaultTranslations,
    }),
    ...(Object.keys(customFieldTranslations).length > 0 && {
      custom_field_translations: customFieldTranslations,
    }),
    ...(defaultDetails?.currency_id && {
      currency_id: defaultDetails?.currency_id,
    }),
  };

  if (mode === "edit") {
    const payload = {
      ...base,
      id: itemId,
      delete_item_image_id: deleteImagesId,
      ...((defaultDetails.video_type || "file") === "file" &&
        !defaultDetails.existing_product_video_url &&
        !defaultDetails.product_video && { delete_product_video: true }),
      seo_details: seoDetails,
    };
    if (is_job_category) {
      payload.min_salary = defaultDetails.min_salary;
      payload.max_salary = defaultDetails.max_salary;
    } else {
      payload.price = defaultDetails.price;
    }
    return payload;
  }

  // create
  const payload = {
    ...base,
    category_id: categoryId,
    ...(seoDetails?.length > 0 && { seo_details: seoDetails }),
    item_type: itemType === "video" ? "reel" : "normal",
  };
  if (is_job_category) {
    // only add salary fields when provided
    if (defaultDetails.min_salary) payload.min_salary = defaultDetails.min_salary;
    if (defaultDetails.max_salary) payload.max_salary = defaultDetails.max_salary;
  }
  return payload;
};

// Builds the upload-media params (reel video+thumbnail and/or product video).
// Returns null when there is nothing to upload.
export const buildMediaParams = async ({
  videoData,
  defaultDetails,
  itemId,
  includeReel, // create: always true; edit: only when isReel
}) => {
  let mediaParams = null;

  if (includeReel && videoData && itemId) {
    const { file, trimmedFile, thumbnail } = videoData;
    const thumbBlob = await fetch(thumbnail).then((r) => r.blob());
    const thumbFile = new File([thumbBlob], "thumbnail.jpg", {
      type: "image/jpeg",
    });
    mediaParams = {
      item_id: itemId,
      video: trimmedFile ?? file,
      thumbnail: thumbFile,
    };
  }

  if (
    defaultDetails.video_type === "file" &&
    defaultDetails.product_video &&
    itemId
  ) {
    mediaParams = {
      ...mediaParams,
      item_id: itemId,
      product_video: defaultDetails.product_video,
    };
  }

  return mediaParams;
};
