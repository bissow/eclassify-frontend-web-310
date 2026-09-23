import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

const AdsCategoryCarouselSkeleton = () => {
  return (
    <>
      <div className="space-between">
        <Skeleton className="w-1/4 h-7" />
        <div className="flex gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
      <Carousel className="w-full mt-6" opts={{ align: "start", containScroll: "trim" }}>
        <CarouselContent className="-ml-3 md:-ml-7.5">
          {Array.from({ length: 8 }).map((_, index) => (
            <CarouselItem
              key={index}
              className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/4 xl:basis-[16.66%] 2xl:basis-[12.5%] md:pl-7.5"
            >
              <div className="flex flex-col gap-4">
                <Skeleton className="w-full aspect-square rounded-full" />
                <Skeleton className="w-full h-4" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </>
  );
};

export default AdsCategoryCarouselSkeleton;
