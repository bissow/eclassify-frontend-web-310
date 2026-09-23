"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { userSignUpData } from "@/store/slices/authSlice";
import { useSelector } from "react-redux";
import { getIsRtl } from "@/store/slices/languageSlice";
import CustomImage from "@/components/common/CustomImage";
import { useParams } from "next/navigation";
import Link from "next/link";
import { memo } from "react";
import { getDefaultLanguageCode } from "@/store/slices/settingSlice";
import SectionBanners from "@/components/custom-banners/SectionBanners";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";

const OfferSlider = ({ Slider, aboveBanners, belowBanners }) => {
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);
  const userData = useSelector(userSignUpData);
  const isRTL = useSelector(getIsRtl);
  const { lang: langCode } = useParams();

  useEffect(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <>
      <SectionBanners banners={aboveBanners} className="container my-6 sm:my-12" isPriority />
      <section className="py-6">
        <div className="container">
          <Carousel
            key={isRTL ? "rtl" : "ltr"}
            className="w-full"
            setApi={setApi}
            opts={{
              align: "start",
              containScroll: "trim",
              direction: isRTL ? "rtl" : "ltr",
            }}
            plugins={[Autoplay({ delay: 4000 })]}
          >
            <CarouselContent className="-ml-3 md:-ml-7.5">
              {Slider.map((ele, index) => (
                <SliderItem
                  key={ele?.id}
                  ele={ele}
                  userData={userData}
                  langCode={langCode}
                  isPriorityImage={index < 2}
                  isLCP={index === 0}
                />
              ))}
            </CarouselContent>
            {Slider && Slider?.length > 1 && (
              <>
                <button
                  onClick={() => api?.scrollTo(current - 1)}
                  className={`sm:block absolute z-10 top-1/2 -translate-y-1/2 ltr:left-0 ltr:-translate-x-1/2 rtl:right-0 rtl:translate-x-1/2 bg-primary p-1 md:p-2 rounded-full ${!api?.canScrollPrev() ? "cursor-default" : ""
                    }`}
                  disabled={!api?.canScrollPrev()}
                >
                  <ArrowLeftIcon
                    size={24}
                    weight="bold"
                    color="white"
                    className={isRTL ? "rotate-180" : ""}
                  />
                </button>
                <button
                  onClick={() => api?.scrollTo(current + 1)}
                  className={`sm:block absolute z-10 top-1/2 -translate-y-1/2 ltr:right-0 ltr:translate-x-1/2 rtl:left-0 rtl:-translate-x-1/2 bg-primary p-1 md:p-2 rounded-full ${!api?.canScrollNext() ? "cursor-default" : ""
                    }`}
                  disabled={!api?.canScrollNext()}
                >
                  <ArrowRightIcon
                    size={24}
                    weight="bold"
                    color="white"
                    className={isRTL ? "rotate-180" : ""}
                  />
                </button>
              </>
            )}
          </Carousel>
        </div>
      </section>
      <SectionBanners banners={belowBanners} className="container mt-6 sm:mt-12" />
    </>
  );
};

export default OfferSlider;

// Move the slide rendering logic here
const SliderItem = memo(({ ele, userData, langCode, isPriorityImage, isLCP }) => {
  const defaultLangCode = useSelector(getDefaultLanguageCode);
  const prefix = langCode === defaultLangCode ? "" : `/${langCode}`;

  let href;
  if (ele?.model_type === "App\\Models\\Item") {
    const base = userData && userData?.id === ele?.model?.user_id ? "my-listing" : "ad-details";
    href = `${prefix}/${base}/${ele?.model?.slug}`;
  } else if (ele?.model_type === null) {
    href = ele?.third_party_link;
  } else if (ele?.model_type === "App\\Models\\Category") {
    href = `${prefix}${ele.model.path}`;
  } else {
    href = prefix || "/";
  }

  // 2. Return the JSX for a single slide
  return (
    <CarouselItem className="basis-full md:basis-2/3 pl-3 md:pl-7.5">
      <Link href={href} target={ele?.model_type === null ? "_blank" : ""}>
        <CustomImage
          src={ele.image}
          alt="slider imag"
          width={983}
          height={493}
          sizes="(max-width: 768px) 100vw, 66vw"
          className="aspect-983/493 w-full object-cover rounded-xl"
          loading={isPriorityImage ? "eager" : "lazy"}
          fetchPriority={isLCP ? "high" : undefined}
        />
      </Link>
    </CarouselItem>
  );
});

