"use client";
import { useTranslation } from "@/lang/useTranslation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import BlogCard from "@/components/common/BlogCard";
import { useSelector } from "react-redux";
import { getIsRtl } from "@/store/slices/languageSlice.js";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";

const OurBlogsCarousel = ({ blogs }) => {
  const { t } = useTranslation();
  const isRTL = useSelector(getIsRtl);
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="py-28 bg-muted" id="ourBlogs">
      <div className="container">
        <div className="flex items-center flex-col gap-6">
          <p className="outlinedSecHead">{t("ourBlog")}</p>
          <h1 className="landingSecHeader">
            {t("masteringMarketplace")}
            <br />
            {t("withOurBlog")}
          </h1>
        </div>
        <Carousel
          key={isRTL ? "rtl" : "ltr"}
          className="w-full mt-20"
          setApi={setApi}
          opts={{ align: "start", direction: isRTL ? "rtl" : "ltr" }}
        >
          <CarouselContent className="-ml-3 md:-ml-[30px]">
            {blogs.map((blog) => (
              <CarouselItem
                key={blog?.id}
                className="sm:basis-1/2 xl:basis-1/3 pl-3 md:pl-[30px]"
              >
                <BlogCard blog={blog} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="flex items-center justify-center mt-[30px] gap-4">
          <button
            onClick={() => api?.scrollTo(current - 1)}
            className={`bg-primary p-2 rounded ${!api?.canScrollPrev() ? "opacity-65 cursor-default" : ""
              }`}
            disabled={!api?.canScrollPrev()}
          >
            <ArrowLeftIcon
              weight="bold"
              size={24}
              color="white"
              className={isRTL ? "rotate-180" : ""}
            />
          </button>
          <button
            onClick={() => api?.scrollTo(current + 1)}
            className={`bg-primary p-2 rounded ${!api?.canScrollNext() ? "opacity-65 cursor-default" : ""
              }`}
            disabled={!api?.canScrollNext()}
          >
            <ArrowRightIcon
              size={24} weight="bold"
              color="white"
              className={isRTL ? "rotate-180" : ""}
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default OurBlogsCarousel;
