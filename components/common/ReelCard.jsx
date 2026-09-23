'use client';
import { PlayIcon, SealCheckIcon } from "@phosphor-icons/react";
import CustomImage from "@/components/common/CustomImage";
import CustomLink from "@/components/common/CustomLink";
import { useTranslation } from "@/lang/useTranslation";


const ReelCard = ({ item }) => {

  const { t } = useTranslation();
  const price = item?.item?.formatted_price || item?.item?.formatted_salary_range;

  return (
    <CustomLink
      href={`/reel/${item?.id}`}
      className="relative w-full aspect-9/16 rounded-xl overflow-hidden block"
    >
      <CustomImage
        src={item?.thumbnail}
        alt={item?.item?.translation?.name}
        width={181}
        height={322}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
      {item?.item?.is_feature && (
        <div className="flex items-center gap-1 rounded py-0.5 px-1 bg-primary absolute top-3 ltr:left-3 rtl:right-3">
          <SealCheckIcon size={16} color="white" weight="bold" />
          <p className="text-white text-xs sm:text-sm">{t("featured")}</p>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/60 rounded-full p-2">
          <PlayIcon size={20} weight="fill" color="white" className="rtl:scale-x-[-1]" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-1">
        <p className="text-white text-sm font-bold truncate">{item?.item?.translation?.name}</p>
        {price && <p className="text-white font-bold break-all">{price}</p>}
        <p className="text-white font-bold text-sm truncate">{item?.item?.translation?.address}</p>
      </div>
    </CustomLink>
  );
};

export default ReelCard;
