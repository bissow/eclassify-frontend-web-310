import { Skeleton } from "@/components/ui/skeleton";
import AdCardSkeleton from "@/components/common/AdCardSkeleton";

const FeaturedSectionsSkeleton = () => {
  return (
    <>
      <div className="space-between gap-2 mt-12">
        <Skeleton className="w-1/6 h-4" />
        <Skeleton className="w-1/12 h-4" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6 mt-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <AdCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
};

export default FeaturedSectionsSkeleton;
