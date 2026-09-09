import { useTranslation } from "@/lang/useTranslation";
import { getReduxCurrentLangCode } from "@/store/slices/languageSlice";
import { formatDateMonthYear } from "@/lib/format";
import { BriefcaseIcon, CalendarCheckIcon, HeartIcon, EyeIcon } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { deleteItemApi } from "@/lib/api";
import CustomLink from "@/components/common/CustomLink";
import { getCompanyName } from "@/store/slices/settingSlice";
import ShareDropdown from "@/components/common/ShareDropdown";
import { useState } from "react";
import JobApplicationModal from "@/features/ad-details/jobs/JobApplicationModal";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { useNavigate } from "@/hooks/useNavigate";
import { useParams } from "next/navigation";

const MyAdsListingDetailCard = ({ productDetails }) => {
  const { navigate } = useNavigate();
  const { lang } = useParams();
  const CompanyName = useSelector(getCompanyName);

  const [IsDeleteAccount, setIsDeleteAccount] = useState(false);
  const [IsDeletingAccount, setIsDeletingAccount] = useState(false);

  const [IsShowJobApplications, setIsShowJobApplications] = useState(false);
  const productName =
    productDetails?.translated_item?.name || productDetails?.name;
  // share variables
  const currentUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${lang}/ad-details/${productDetails?.slug}`;
  const FbTitle = productName + " | " + CompanyName;
  const headline = `🚀 Discover the perfect deal! Explore "${productName}" from ${CompanyName} and grab it before it's gone. Shop now at`;
  const { t } = useTranslation();
  const langCode = useSelector(getReduxCurrentLangCode);
  const isEditable =
    productDetails?.status &&
    !["permanent rejected", "inactive", "sold out", "expired"].includes(
      productDetails.status
    );

  // job application variables
  const isJobCategory = Number(productDetails?.category?.is_job_category) === 1;
  const isShowReceivedJobApplications =
    isJobCategory &&
    (productDetails?.status === "approved" ||
      productDetails?.status === "featured" ||
      productDetails?.status === "sold out");

  const price = isJobCategory
    ? productDetails?.formatted_salary_range
    : productDetails?.formatted_price;

  const activePromo =
    productDetails?.active_promotion_item ||
    productDetails?.active_promotions?.sales?.[0];
  const promotionalPrice =
    activePromo?.formatted_promotional_price ||
    (activePromo?.promotional_price ? `${activePromo.promotional_price}` : null);

  const deleteAd = async () => {
    try {
      setIsDeletingAccount(true);
      const res = await deleteItemApi.deleteItem({
        item_id: productDetails?.id,
      });
      if (res?.data?.error === false) {
        toast.success(t("adDeleted"));
        navigate("/my-ads");
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <>
      <div className="flex flex-col border rounded-lg">
        <div className="flex  w-full flex-col gap-4 p-4 border-b">
          <div className="flex justify-between max-w-full">
            <h1
              className="text-2xl font-medium word-break-all line-clamp-2"
              title={productName}
            >
              {productName}
            </h1>
            {productDetails?.status === "approved" && (
              <ShareDropdown
                url={currentUrl}
                title={FbTitle}
                headline={headline}
                companyName={CompanyName}
                className="rounded-full size-10 flex items-center justify-center p-2 border"
              />
            )}
          </div>
          {/* Promotion / Sale Badge */}
          {activePromo && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white bg-destructive shadow-xs">
                🔥 {activePromo.discount_type === "percentage" || activePromo.discount_percentage
                  ? `${activePromo.discount_percentage || activePromo.discount_value}% OFF`
                  : `SAVE ${activePromo.discount_value}`} - {t("specialOffer") || "SALE"}
              </span>
              {activePromo.remaining_stock_quantity <= 5 && activePromo.remaining_stock_quantity > 0 && (
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  ⚡ {t("onlyFewLeft") || `Only ${activePromo.remaining_stock_quantity} left in stock!`}
                </span>
              )}
            </div>
          )}
          <div className="flex justify-between items-end w-full">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2
                className="text-primary text-3xl font-bold break-all text-balance line-clamp-2"
                title={price}
              >
                {promotionalPrice || price}
              </h2>
              {activePromo && (
                <span className="text-lg font-medium line-through text-muted-foreground">
                  {price}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              {t("adId")} #{productDetails?.id}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center text-muted-foreground gap-1 p-4 border-b flex-wrap">
          <div className="text-sm flex items-center gap-1 ">
            <CalendarCheckIcon size={14} weight="bold" />
            {t("postedOn")}: {formatDateMonthYear(productDetails?.created_at, langCode)}
          </div>
          <div className="ltr:border-l rtl:border-r gap-1 flex items-center text-sm px-2">
            <EyeIcon size={14} weight="bold" />
            {t("views")}: {productDetails?.clicks}
          </div>
          <div className="ltr:border-l rtl:border-r gap-1 flex items-center text-sm px-2">
            <HeartIcon size={14} weight="bold" />
            {t("favorites")}: {productDetails?.total_likes}
          </div>
        </div>
        <div className="p-4 flex items-center gap-4 flex-wrap">
          <button
            className="py-2 px-4 flex-1 rounded-md bg-black text-white font-medium"
            onClick={() => setIsDeleteAccount(true)}
          >
            {t("delete")}
          </button>

          {isEditable && (
            <CustomLink
              href={`/edit-listing/${productDetails?.id}`}
              className="bg-primary py-2 px-4 flex-1 rounded-md text-white font-medium text-center"
            >
              {t("edit")}
            </CustomLink>
          )}

          {isShowReceivedJobApplications && (
            <button
              onClick={() => setIsShowJobApplications(true)}
              className="bg-black py-2 px-4 flex-1 rounded-md text-white font-medium whitespace-nowrap flex items-center gap-2 justify-center"
            >
              <BriefcaseIcon />
              {t("jobApplications")}
            </button>
          )}
        </div>
      </div>
      <JobApplicationModal
        IsShowJobApplications={IsShowJobApplications}
        setIsShowJobApplications={setIsShowJobApplications}
        listingId={productDetails?.id}
        isJobFilled={productDetails?.status === "sold out"}
      />
      <DeleteConfirmDialog
        open={IsDeleteAccount}
        onCancel={() => setIsDeleteAccount(false)}
        onConfirm={deleteAd}
        title={t("areYouSure")}
        description={t("youWantToDeleteThisAd")}
        confirmDisabled={IsDeletingAccount}
      />
    </>
  );
};

export default MyAdsListingDetailCard;
