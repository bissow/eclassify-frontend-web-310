"use client";
import { useEffect, useState } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelector } from "react-redux";
import { useTranslation } from "@/lang/useTranslation";
import { getIsRtl } from "@/store/slices/languageSlice.js";
import { getReelsApi } from "@/lib/api";
import { ArrowLeftIcon, ArrowRightIcon, CircleNotchIcon } from "@phosphor-icons/react";
import ReelCard from "@/components/common/ReelCard";
import { EXPLORE_VIDEOS_PER_PAGE as PER_PAGE } from "@/lib/constants";

const SKELETON_COUNT = 8;

export const ExploreVideosSkeleton = () => (
    <section className="container mt-6 sm:mt-12">
        <div className="space-between">
            <Skeleton className="w-1/4 h-6" />
            <Skeleton className="w-16 h-8" />
        </div>
        <Carousel
            className="w-full mt-6"
            opts={{ align: "start", containScroll: "trim" }}
        >
            <CarouselContent className="-ml-3 md:-ml-4">
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <CarouselItem
                        key={i}
                        className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 md:pl-4"
                    >
                        <Skeleton className="w-full aspect-9/16 rounded-xl" />
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    </section>
);

const ExploreVideos = ({
    initialVideosData,
    initialHasMore,
    initialPage,
    initialCityData,
    initialKmRange,
}) => {
    const { t } = useTranslation();
    const isRTL = useSelector(getIsRtl);
    const [videosData, setVideosData] = useState(initialVideosData);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [page, setPage] = useState(initialPage);

    const [api, setApi] = useState();
    const [current, setCurrent] = useState(0);

    const update = () => setCurrent(api.selectedScrollSnap());

    useEffect(() => {
        if (!api) return;
        update();
        api.on("select", update);
        return () => api.off("select", update);
    }, [api]);

    // Only handles "load more via carousel next" (page 2+) — page 1 is
    // server-fetched (ExploreVideosSection.jsx) using the same location params.
    const getReels = async (pageNum) => {
        setIsFetchingMore(true);
        try {
            const params = { per_page: PER_PAGE, page: pageNum };
            if (
                Number(initialKmRange) > 0 &&
                (initialCityData?.areaId || initialCityData?.city)
            ) {
                params.radius = initialKmRange;
                params.latitude = initialCityData.lat;
                params.longitude = initialCityData.long;
            } else if (initialCityData?.areaId) {
                params.area_id = initialCityData.areaId;
            } else if (initialCityData?.city) {
                params.city = initialCityData.city;
            } else if (initialCityData?.state) {
                params.state = initialCityData.state;
            } else if (initialCityData?.country) {
                params.country = initialCityData.country;
            }
            const res = await getReelsApi.getReels(params);
            if (res?.data?.error === false) {
                const data = res?.data?.data;
                const newReels = data?.data || [];
                setVideosData((prev) => [...prev, ...newReels]);
                setHasMore(data?.current_page < data?.last_page);
                setPage(pageNum);
            }
        } catch (error) {
            console.error("Explore videos error:", error);
        } finally {
            setIsFetchingMore(false);
        }
    };

    const handleNext = async () => {
        if (!api) return;
        if (api.canScrollNext()) {
            api.scrollTo(current + 1);
        } else if (hasMore && !isFetchingMore) {
            await getReels(page + 1);
            setTimeout(() => api?.scrollTo(current + 1), 200);
        }
    };

    const isNextDisabled = (!api?.canScrollNext() && !hasMore) || isFetchingMore;
    const isPrevDisabled = !api?.canScrollPrev();
    const showNavButtons = !(isPrevDisabled && isNextDisabled);

    return (
        <section className="container mt-6 sm:mt-12">
            <div className="space-between">
                <h5 className="text-xl sm:text-2xl font-medium">
                    {t("exploreVideos")}
                </h5>
                {showNavButtons && (
                    <div className="flex items-center justify-center gap-2 sm:gap-4">
                        <button
                            onClick={() => api && api.scrollTo(current - 1)}
                            className={`bg-primary p-1 sm:p-2 rounded-full ${isPrevDisabled ? "opacity-65 cursor-default" : ""}`}
                            disabled={isPrevDisabled}
                        >
                            <ArrowLeftIcon size={24} weight="bold" color="white" className="rtl:rotate-180" />
                        </button>
                        <button
                            onClick={handleNext}
                            className={`bg-primary p-1 sm:p-2 rounded-full ${isNextDisabled ? "opacity-65 cursor-default" : ""}`}
                            disabled={isNextDisabled}
                        >
                            {isFetchingMore
                                ? <CircleNotchIcon size={24} color="white" className="animate-spin" />
                                : <ArrowRightIcon size={24} weight="bold" color="white" className="rtl:rotate-180" />
                            }
                        </button>
                    </div>
                )}
            </div>
            <Carousel
                key={isRTL ? "rtl" : "ltr"}
                className="w-full mt-6"
                setApi={setApi}
                opts={{
                    align: "start",
                    containScroll: "trim",
                    direction: isRTL ? "rtl" : "ltr",
                }}
            >
                <CarouselContent className="-ml-3 md:-ml-4">
                    {videosData.map((item, i) => (
                        <CarouselItem
                            key={item?.id ?? i}
                            className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 md:pl-4"
                        >
                            <ReelCard item={item} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </section>
    );
};

export default ExploreVideos;
