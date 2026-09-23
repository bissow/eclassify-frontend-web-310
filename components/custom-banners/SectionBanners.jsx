import { memo } from "react";
import BannerAd from "./BannerAd";
import { cn } from "@/lib/utils";

const SectionBanners = ({ banners, className = "", isPriority = false }) => {
  if (!banners?.length) return null;


  return (
    <div className={className}>
      {banners.map((item, i) => {
        const isDual = Array.isArray(item);
        const isSideLayout = isDual && item[0].layout.includes("_side");
        const groupIsPriority = isPriority && i === 0;

        return (
          <div key={isDual ? item[0].id : item.id} className={cn("grid gap-3 sm:gap-7", isDual && !isSideLayout ? "sm:grid-cols-2" : "grid-cols-1")}>
            {isDual
              ? item.map(b => <BannerAd key={b.id} banner={b} isPriority={groupIsPriority} />)
              : <BannerAd banner={item} isPriority={groupIsPriority} />
            }
          </div>
        );
      })}
    </div>
  );
};

export default memo(SectionBanners);
