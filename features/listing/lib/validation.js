import { toast } from "sonner";
import { isValidURL, isValidVimeoUrl, isValidYouTubeUrl } from "@/lib/media";
import { isValidPhoneNumber } from "libphonenumber-js/max";

// Shared listing form validation. Pure: reads args, toasts on failure, returns boolean.
// Used by both AdsListing (create) and EditListing (edit).

export const SLUG_RE = /^[a-z0-9-]+$/i;
export const isEmpty = (x) => !x || !x.toString().trim();
export const isNegative = (n) => Number(n) < 0;

export const VIDEO_LINK_VALIDATORS = {
  youtube_link: isValidYouTubeUrl,
  vimeo_link: isValidVimeoUrl,
  other_link: isValidURL,
};

export const VIDEO_LINK_ERROR_KEYS = {
  youtube_link: "enterValidYoutubeLink",
  vimeo_link: "enterValidVimeoLink",
  other_link: "enterValidUrl",
};

// Details step: title/description, optional phone, price or job salary, slug.
export const validateListingDetails = ({
  defaultDetails,
  is_job_category,
  isPriceOptional,
  t,
}) => {
  const {
    name,
    description,
    price,
    slug,
    contact,
    min_salary,
    max_salary,
    country_code,
  } = defaultDetails;

  if (isEmpty(name) || isEmpty(description)) {
    toast.error(t("completeDetails"));
    return false;
  }

  // Validate phone only if entered (optional field).
  if (Boolean(contact) && !isValidPhoneNumber(`+${country_code}${contact}`)) {
    toast.error(t("invalidPhoneNumber"));
    return false;
  }

  if (is_job_category) {
    const min = min_salary ? Number(min_salary) : null;
    const max = max_salary ? Number(max_salary) : null;

    if (min !== null && min < 0) {
      toast.error(t("enterValidSalaryMin"));
      return false;
    }
    if (max !== null && max < 0) {
      toast.error(t("enterValidSalaryMax"));
      return false;
    }
    if (min !== null && max !== null) {
      if (min === max) {
        toast.error(t("salaryMinCannotBeEqualMax"));
        return false;
      }
      if (min > max) {
        toast.error(t("salaryMinCannotBeGreaterThanMax"));
        return false;
      }
    }
  } else {
    if (!isPriceOptional && isEmpty(price)) {
      toast.error(t("completeDetails"));
      return false;
    }
    if (!isEmpty(price) && isNegative(price)) {
      toast.error(t("enterValidPrice"));
      return false;
    }
  }

  if (!isEmpty(slug) && !SLUG_RE.test(slug.trim())) {
    toast.error(t("addValidSlug"));
    return false;
  }

  return true;
};

// Media step: video link (if link type), custom video size, reel duration/size
// within limit (post-trim), at least one gallery image.
export const validateListingMedia = ({
  defaultDetails,
  videoData,
  otherImages,
  videoMaxSize,
  reelMaxDuration,
  reelMaxSize,
  isReel = true,
  t,
}) => {
  const videoLinkValidator = VIDEO_LINK_VALIDATORS[defaultDetails.video_type];
  if (videoLinkValidator) {
    if (isEmpty(defaultDetails.video_link)) {
      toast.error(t("videoLinkRequired"));
      return false;
    }
    if (!videoLinkValidator(defaultDetails.video_link)) {
      toast.error(t(VIDEO_LINK_ERROR_KEYS[defaultDetails.video_type]));
      return false;
    }
  }

  if (
    (defaultDetails.video_type || "file") === "file" &&
    defaultDetails.product_video
  ) {
    const productVideoSizeMB =
      defaultDetails.product_video.size / (1024 * 1024);
    if (videoMaxSize && productVideoSizeMB > videoMaxSize) {
      toast.error(`${t("videoExceedsMaxSize")} ${videoMaxSize} MB`);
      return false;
    }
  }

  if (isReel && videoData) {
    const { file, trimmedFile, duration, trimStart, trimEnd } = videoData;
    const effectiveDuration =
      trimStart != null && trimEnd != null ? trimEnd - trimStart : duration;
    if (reelMaxDuration && effectiveDuration > reelMaxDuration) {
      toast.error(`${t("videoExceedsMaxDuration")} ${reelMaxDuration}s`);
      return false;
    }
    const effectiveSizeMB = trimmedFile
      ? trimmedFile.size / (1024 * 1024)
      : duration > 0
        ? (file.size / (1024 * 1024)) * (effectiveDuration / duration)
        : file.size / (1024 * 1024);
    if (reelMaxSize && effectiveSizeMB > reelMaxSize) {
      toast.error(`${t("videoExceedsMaxSize")} ${reelMaxSize} MB`);
      return false;
    }
  }

  if (otherImages.length === 0) {
    toast.error(t("uploadMainPicture"));
    return false;
  }

  return true;
};

// SEO details validation: schema (if present) must be valid JSON-LD.
export const validateSeoDetails = (seoDetails, languages, defaultLangId, t) => {
  return seoDetails.every((item) => {
    const schema = item?.schema?.trim();
    if (!schema) return true; // Skip empty schema
    try {
      const parsed = JSON.parse(schema);
      if (parsed["@context"] && parsed["@type"]) return true; // Valid
    } catch (e) { /* Fall through to error */ }
    // If we are here, it's invalid
    const lang = languages?.find((l) => String(l.id) === String(item.language_id));
    const prefix = String(item.language_id) === String(defaultLangId) ? "" : `${lang?.name}: `;
    toast.error(`${prefix}${t("invalidJsonSchema")}`);
    return false; // Stop validation
  });
};
