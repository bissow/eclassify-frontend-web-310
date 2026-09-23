"use client";
import { useState } from "react";
import SectionBanners from "@/components/custom-banners/SectionBanners";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import AdCard from "@/components/common/AdCard";
import { useSelector } from "react-redux";
import { getIsRtl } from "@/store/slices/languageSlice";
import { useTranslation } from "@/lang/useTranslation";

// Data is server-fetched (SimilarAdsSection); this owns the carousel and the
// optimistic like toggle only.
const SimilarAds = ({ initialItems = [], aboveBanners, belowBanners }) => {
  const { t } = useTranslation();
  const [similarData, setSimilarData] = useState(initialItems);
  const isRTL = useSelector(getIsRtl);

  if (!similarData?.length) return null;

  const handleLikeAllData = (id, liked) => {
    setSimilarData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_liked: liked } : item))
    );
  };

  return (
    <div className="flex flex-col gap-5 mt-8">
      <SectionBanners banners={aboveBanners} className="mb-3" />
      <h2 className="text-2xl font-medium">{t("relatedAds")}</h2>
      <Carousel
        key={isRTL ? "rtl" : "ltr"}
        opts={{
          direction: isRTL ? "rtl" : "ltr",
        }}
      >
        <CarouselContent>
          {similarData?.map((item) => (
            <CarouselItem
              key={item.id}
              className="md:basis-1/3 lg:basis-[25%] basis-2/3 sm:basis-1/2"
            >
              <AdCard item={item} handleLike={handleLikeAllData} />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="hidden disabled:hidden md:flex absolute top-1/2 ltr:left-2 rtl:right-2 rtl:scale-x-[-1] -translate-y-1/2 bg-primary text-white rounded-full disabled:pointer-events-auto" />
        <CarouselNext className="hidden disabled:hidden md:flex absolute top-1/2 ltr:right-2 rtl:left-2 rtl:scale-x-[-1] -translate-y-1/2 bg-primary text-white rounded-full disabled:pointer-events-auto" />

        {similarData?.length > 1 && (
          <div className="md:hidden flex items-center justify-center gap-3 mt-4">
            <CarouselPrevious className="static translate-y-0 bg-primary text-white rounded-full h-10 w-10 rtl:scale-x-[-1]" />
            <CarouselNext className="static translate-y-0 bg-primary text-white rounded-full h-10 w-10 rtl:scale-x-[-1]" />
          </div>
        )}
      </Carousel>
      <SectionBanners banners={belowBanners} className="mt-3" />
    </div >
  );
};

export default SimilarAds;
