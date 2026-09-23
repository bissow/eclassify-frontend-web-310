import AdCardSkeleton from "@/components/common/AdCardSkeleton";

// Server-safe fallbacks: no t() (client-only) so these can sit in a
// server-rendered <Suspense fallback>.
// Grid only — the sort/view bar is part of the suspended section, so drawing a
// placeholder for it would flash a fake toolbar over the real one on sorts.
export const SellerListingsSkeleton = () => (
  <div className="grid grid-cols-12 gap-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="col-span-6 lg:col-span-4">
        <AdCardSkeleton />
      </div>
    ))}
  </div>
);
