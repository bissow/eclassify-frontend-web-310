import AdCardSkeleton from "@/components/common/AdCardSkeleton";
import { ADS_PER_PAGE } from "@/features/ads/lib/adsData";

// Suspense fallback for the streamed listing. The toolbar lives outside the
// boundary, so only the cards are replaced while a new filter set loads.
const AdsListingSkeleton = () => (
  <div className="grid grid-cols-12 gap-4">
    {Array.from({ length: ADS_PER_PAGE }).map((_, index) => (
      <div
        key={index}
        className="col-span-6 md:col-span-4 lg:col-span-6 xl:col-span-4 2xl:col-span-3"
      >
        <AdCardSkeleton />
      </div>
    ))}
  </div>
);

export default AdsListingSkeleton;
