"use client";
import { useState } from "react";
import AdFeature from "@/features/ad-details/AdFeature";
import AdDescription from "@/features/ad-details/AdDescription";
import AdDetailCard from "@/features/ad-details/AdDetailCard";
import SellerDetailCard from "@/features/ad-details/SellerDetailCard";
import AdLocation from "@/features/ad-details/AdLocation";
import AdsReportCard from "@/features/ad-details/report/AdsReportCard";
import MyAdsListingDetailCard from "@/features/ad-details/owner/MyAdsListingDetailCard";
import AdsStatusChangeCards from "@/features/ad-details/owner/AdsStatusChangeCards";
import AdGallery from "@/features/ad-details/AdGallery";
import { useTranslation } from "@/lang/useTranslation";
import { getFilteredCustomFields } from "@/lib/form";
import { truncate } from "@/lib/utils";
import { getYouTubeVideoId } from "@/lib/media";
import OpenInApp from "@/components/common/OpenInApp";
import { useSelector } from "react-redux";
import { CurrentLanguageData } from "@/store/slices/languageSlice";
import BreadCrumb from "@/components/common/BreadCrumb";
import MakeFeaturedAd from "@/features/ad-details/owner/MakeFeaturedAd";
import RenewAd from "@/features/ad-details/owner/RenewAd";
import AdEditedByAdmin from "@/features/ad-details/owner/AdEditedByAdmin";
import NoData from "@/components/empty-states/NoData";
import AdUnit from "@/components/adsense/AdUnit";
import SectionBanners from "@/components/custom-banners/SectionBanners";

// Pure derivation of the item — was three extra useState slots kept in sync by
// two near-identical fetch functions.
const getVideoData = (item) => {
  const video = item?.item_video;
  // isFile: uploaded media (real first frame) vs a Vimeo link (no thumbnail here)
  if (video?.video_type === "file" && video?.video_file) {
    return { url: video.video_file, thumbnail: "", isFile: true };
  }
  if (video?.video_link) {
    const videoId = getYouTubeVideoId(video.video_link);
    return {
      url: video.video_link,
      thumbnail: videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : "",
      isFile: false,
    };
  }
  return { url: "", thumbnail: "", isFile: false };
};

// The item is server-fetched with the cookie token (lib/server/adDetail.js) and
// arrives as a prop — no fetch, no loader. This owns the mutations only:
// favourite/report/offer, feature, renew and owner status changes all write
// back through setProductDetails.
const AdDetails = ({
  item,
  isMyListing = false,
  categoryTrail = [],
  bannerMap = {},
  reelData = null,
  similarAds = null,
}) => {
  const { t } = useTranslation();
  const CurrentLanguage = useSelector(CurrentLanguageData);
  const [productDetails, setProductDetails] = useState(item);
  const [status, setStatus] = useState(item?.status || "");

  const itemName = truncate(
    item?.translated_item?.name,
    80
  );

  if (!productDetails) {
    return (
      <div className="container mt-8">
        <NoData title={t("noAdvertisementFound")} />
      </div>
    );
  }

  const videoData = getVideoData(productDetails);
  const filteredFields = getFilteredCustomFields(
    productDetails?.all_translated_custom_fields,
    CurrentLanguage?.id
  );

  const IsShowFeaturedAd =
    isMyListing &&
    !productDetails?.is_feature &&
    productDetails?.status === "approved";
  const isMyAdExpired = isMyListing && productDetails?.status === "expired";
  const isEditedByAdmin =
    isMyListing && productDetails?.is_edited_by_admin === 1;

  return (
    <>
      <BreadCrumb
        items={
          isMyListing
            ? [{ nameKey: "myAds", href: "/my-ads" }, { name: itemName }]
            : [
              { nameKey: "ads", href: "/ads" },
              // Ancestors root→leaf; each links to its own cumulative path,
              // matching the /ads/[...categorySlug] routes.
              ...categoryTrail.map((category, index) => ({
                name: category.translated_name || category.name,
                href: `/ads/${categoryTrail
                  .slice(0, index + 1)
                  .map((c) => c.slug)
                  .join("/")}`,
              })),
              { name: itemName },
            ]
        }
      />
      <div className="container mt-8">
        <div className="flex flex-col gap-6">
          <SectionBanners banners={bannerMap["ad_info_above"]} />
          <AdUnit type='banner' />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 mt-6">
          <div className="col-span-1 lg:col-span-8">
            <div className="flex flex-col gap-7">
              <AdGallery
                galleryImages={productDetails?.gallery_images}
                videoData={videoData}
                reelThumbnail={reelData?.thumbnail}
                reelId={reelData?.id}
                isOwner={isMyListing}
              />

              {IsShowFeaturedAd && (
                <MakeFeaturedAd
                  item_id={productDetails?.id}
                  setProductDetails={setProductDetails}
                />
              )}

              {filteredFields.length > 0 && (
                <AdFeature filteredFields={filteredFields} />
              )}
              <AdDescription productDetails={productDetails} />
              <AdLocation productDetails={productDetails} />
              {!isMyListing && !productDetails?.is_already_reported && (
                <AdsReportCard
                  productDetails={productDetails}
                  setProductDetails={setProductDetails}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col col-span-1 lg:col-span-4 gap-7">
            {isMyListing ? (
              <MyAdsListingDetailCard productDetails={productDetails} />
            ) : (
              <AdDetailCard
                productDetails={productDetails}
                setProductDetails={setProductDetails}
              />
            )}

            {!isMyListing && (
              <SellerDetailCard
                productDetails={productDetails}
                setProductDetails={setProductDetails}
              />
            )}

            {isMyListing && (
              <AdsStatusChangeCards
                productDetails={productDetails}
                setProductDetails={setProductDetails}
                status={status}
                setStatus={setStatus}
              />
            )}

            {isEditedByAdmin && (
              <AdEditedByAdmin
                admin_edit_reason={productDetails?.admin_edit_reason}
              />
            )}
            {isMyAdExpired && (
              <RenewAd
                item_id={productDetails?.id}
                setProductDetails={setProductDetails}
                setStatus={setStatus}
                categoryId={productDetails?.category?.id}
                categoryName={productDetails?.category?.translated_name}
                isVideoAd={productDetails?.item_type === "reel"}
              />
            )}
            <SectionBanners banners={bannerMap["ad_info_side"]} className="hidden lg:block" />
            <AdUnit type='square' className="aspect-square" />
          </div>
        </div>
        {!isMyListing && similarAds}
        <AdUnit type='banner' className="mt-8" />
        <OpenInApp enabled={!isMyListing} />
      </div>
    </>
  );
};

export default AdDetails;
