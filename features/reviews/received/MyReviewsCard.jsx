"use client";
import StarRating from "@/components/common/StarRating";
import { useTranslation, useLocale } from "@/lang/useTranslation";
import { timeAgo } from "@/lib/format";
import { useState } from "react";
import ReportReviewModal from "@/features/reviews/received/ReportReviewModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CustomImage from "@/components/common/CustomImage";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { REVIEW_CLAMP_LENGTH } from "@/lib/constants";

const MyReviewsCard = ({ rating, setMyReviews }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);
  const [IsReportModalOpen, setIsReportModalOpen] = useState(false);
  const [SellerReviewId, setSellerReviewId] = useState("");

  const fullReview = rating?.review?.trim() || "";
  const isOverflowing = fullReview.length > REVIEW_CLAMP_LENGTH;
  const visibleReview =
    isOverflowing && !isExpanded
      ? `${fullReview.slice(0, REVIEW_CLAMP_LENGTH).trimEnd()}...`
      : fullReview;

  const handleReportClick = (id) => {
    setSellerReviewId(id);
    setIsReportModalOpen(true);
  };

  return (
    <div className="bg-white p-4 rounded-lg flex flex-col gap-4">
      <div className="flex flex-row flex-1 gap-4">
        <div className="relative w-fit">
          <CustomImage
            src={rating?.buyer?.profile}
            width={72}
            height={72}
            alt="Reviewer"
            className="aspect-square rounded-full object-cover size-12 sm:size-16 shrink-0!"
          />
          <CustomImage
            src={rating?.item?.image}
            width={36}
            height={36}
            alt="Reviewer"
            className="size-6! sm:size-8! absolute top-7 sm:top-9 -bottom-2.5 sm:-bottom-1.5 -right-0.5 w-9 h-auto aspect-square rounded-full object-cover shrink-0!"
          />
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <div className="flex flex-1 items-center justify-between">
            <p className="text-sm sm:text-base font-semibold">{rating?.buyer?.name}</p>
            {rating?.report_status ? (
              <div></div>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => handleReportClick(rating?.id)}>
                      <WarningCircleIcon />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" align="center">
                    <p>{t("reportReview")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <p className="text-xs sm:text-sm line-clamp-1">
            {rating?.item?.translation?.name}
          </p>

          <div className="flex items-center gap-1 justify-between">
            <div className="flex items-center gap-1">
              <StarRating rating={Number(rating?.ratings)} className="size-4 sm:size-6" />
              <span className="text-sm text-muted-foreground">
                {rating?.ratings}
              </span>
            </div>
            <p className="text-xs sm:text-sm mt-1 justify-self-end">
              {timeAgo(rating?.created_at, locale, t)}
            </p>
          </div>
        </div>
      </div>

      <div className="border-b"></div>

      <div>
        <p>
          {visibleReview}
          {isOverflowing && (
            <>
              {" "}
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="text-primary text-sm font-medium hover:underline"
              >
                {isExpanded ? t("seeLess") : t("seeMore")}
              </button>
            </>
          )}
        </p>
      </div>

      {/* Report Review Modal */}
      <ReportReviewModal
        isOpen={IsReportModalOpen}
        setIsOpen={setIsReportModalOpen}
        reviewId={SellerReviewId}
        setMyReviews={setMyReviews}
      />
    </div>
  );
};
export default MyReviewsCard;
