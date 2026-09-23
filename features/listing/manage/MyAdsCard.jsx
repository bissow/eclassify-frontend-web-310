import CustomLink from "@/components/common/CustomLink";
import { useTranslation } from "@/lang/useTranslation";
import CustomImage from "@/components/common/CustomImage";
import GetMyAdStatus from "@/features/listing/manage/GetMyAdStatus";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckSquareOffsetIcon, EyeIcon, FireIcon, HeartIcon, LightningIcon, PlayCircleIcon, RocketLaunchIcon, SparkleIcon, TagIcon, TrashIcon } from "@phosphor-icons/react";

const MyAdsCard = ({
  data,
  isApprovedSort,
  isSelected = false,
  isSelectable = false,
  onSelectionToggle,
  onContextMenuAction,
}) => {
  const { t } = useTranslation();
  const isAdminEdited = Number(data?.is_edited_by_admin) === 1;
  const translation = data?.translation;

  // normal ads carry a price, job ads a salary range
  const price = data?.formatted_price || data?.formatted_salary_range;
  const isHidePrice = !price;
  const isJobCategory = data?.formatted_salary_range != null;

  const status = data?.status;
  const isExpired = status === "expired";

  // Card content JSX to avoid duplication
  const cardContent = (
    <div
      className={`relative border flex flex-col gap-2 rounded-xl p-2 hover:shadow-md transition-all duration-200 ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""
        }`}
    >
      {/* Selection checkbox - only show in selection mode */}
      {isSelectable && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectionToggle}
            className="bg-white shadow-xs border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
      )}

      {/* Main card content */}
      <CustomLink
        href={`/my-listing/${data?.slug}`}
        className="flex flex-col gap-2"
        onClick={(e) => {
          if (isSelectable) {
            e.preventDefault();
            onSelectionToggle();
          } else {
            // For navigation, ensure the event propagates properly
            // Don't prevent default or stop propagation for normal clicks
          }
        }}
      >
        <CustomImage
          src={data?.image}
          width={220}
          height={220}
          alt={data?.image}
          className="w-full h-auto aspect-square rounded-sm object-cover"
        />

        <div className="flex items-center gap-2 flex-wrap">
          {status && (
            <GetMyAdStatus
              status={status}
              isApprovedSort={isApprovedSort}
              isFeature={data?.is_feature}
              isJobCategory={isJobCategory}
            />
          )}

          {isAdminEdited && (
            <div className="py-1 px-2 bg-red-400/15 rounded-sm text-destructive text-sm">
              {t("adminEdited")}
            </div>
          )}

          {data?.item_type === "reel" && (
            <div className="bg-muted size-7 rounded-full ml-auto flex items-center justify-center" >
              <PlayCircleIcon weight="regular" className="text-primary size-5" />
            </div>
          )}
        </div>

        {/* Active Promotions & Campaigns Badge Strip */}
        {data?.active_promotions?.has_active_promotions && (
          <div className="flex items-center gap-1.5 flex-wrap my-1">
            {data.active_promotions.is_daily_bumped && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                <RocketLaunchIcon size={12} weight="fill" />
                {t("dailyBump") || "Bumped"}
              </span>
            )}
            {data.active_promotions.is_top_ad && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <FireIcon size={12} weight="fill" />
                {t("topAd") || "Top Ad"}
              </span>
            )}
            {data.active_promotions.is_spotlight && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                <SparkleIcon size={12} weight="fill" />
                {t("spotlight") || "Spotlight"}
              </span>
            )}
            {data.active_promotions.sales?.map((sale) => (
              <span
                key={sale.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20"
                title={`${sale.promotion_title}${sale.campaign_title ? ` (${sale.campaign_title})` : ''}`}
              >
                <LightningIcon size={11} weight="fill" />
                {sale.campaign_title ? sale.campaign_title : (sale.promotion_title || "Active Sale")}
                {sale.discount_percentage ? ` -${sale.discount_percentage}%` : ''}
              </span>
            ))}
          </div>
        )}

        {!isHidePrice && (
          <p className="font-medium line-clamp-1">
            {translation?.name}
          </p>
        )}

        <div className="space-between gap-1">
          {isHidePrice ? (
            <p className="font-medium line-clamp-1">
              {translation?.name}
            </p>
          ) : (
            <p
              className="font-semibold text-lg text-balance break-all line-clamp-2"
              title={price}
            >
              {price}
            </p>
          )}
          <div className="flex items-center gap-1 text-xs">
            <div className="flex items-center gap-1">
              <EyeIcon size={14} className="text-muted-foreground" />
              <span>{data?.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <HeartIcon size={14} className="text-muted-foreground" />
              <span>{data?.likes}</span>
            </div>
          </div>
        </div>
      </CustomLink>
    </div>
  );

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild disabled={!isExpired}>
        {cardContent}
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() => onContextMenuAction("select")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <CheckSquareOffsetIcon size={20} />
          {isSelected ? "Deselect" : "Select"}
        </ContextMenuItem>
        {/* <ContextMenuItem
          onClick={() => onContextMenuAction("renew")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="size-4 text-primary" />
          <span className="text-primary">{t("renew")}</span>
        </ContextMenuItem> */}
        <ContextMenuItem
          onClick={() => onContextMenuAction("delete")}
          className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
        >
          <TrashIcon size={20} />
          {t("remove")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default MyAdsCard;
