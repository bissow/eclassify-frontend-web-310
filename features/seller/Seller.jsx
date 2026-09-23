import { Suspense } from "react";
import BreadCrumb from "@/components/common/BreadCrumb";
import OpenInApp from "@/components/common/OpenInApp";
import SellerDetailCard from "@/features/seller/SellerDetailCard";
import SellerRating from "@/features/seller/reviews/SellerRating";
import SellerTabs from "@/features/seller/SellerTabs";
import SellerNotFound from "@/features/seller/SellerNotFound";
import SellerListingsToolbar from "@/features/seller/listings/SellerListingsToolbar";
import SellerListingsSection from "@/features/seller/listings/SellerListingsSection";
import { SellerListingsSkeleton } from "@/features/seller/listings/SellerListingsSkeleton";
import { getSellerData } from "@/features/seller/lib/sellerData";

// Server shell. get-seller carries the page identity (name for the breadcrumb,
// the no-user check) plus the reviews, so it's awaited here; listings hit a
// second endpoint and stream in their own Suspense boundary.
const Seller = async ({ id, langCode, sortBy }) => {
  const { notFound, seller, ratings, ratingsCount } = await getSellerData(
    id,
    langCode
  );

  if (notFound) return <SellerNotFound />;

  return (
    <>
      <BreadCrumb items={[{ name: seller?.name }]} />
      <div className="container mx-auto mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-4">
            <SellerDetailCard
              initialSeller={seller}
              ratingCount={ratings?.data?.length}
            />
          </div>
          <div className="flex flex-col gap-8 col-span-12 lg:col-span-8">
            <SellerTabs
              listings={
                <>
                  {/* Outside the boundary — stays put while a new sort streams. */}
                  <SellerListingsToolbar id={id} />
                  <Suspense key={sortBy} fallback={<SellerListingsSkeleton />}>
                    <SellerListingsSection
                      id={id}
                      langCode={langCode}
                      sortBy={sortBy}
                    />
                  </Suspense>
                </>
              }
              reviews={
                <SellerRating
                  id={id}
                  initialRatings={ratings}
                  averageRating={
                    seller?.average_rating != null
                      ? Number(seller.average_rating).toFixed(1)
                      : seller?.average_rating
                  }
                  ratings_count={ratingsCount}
                />
              }
            />
          </div>
        </div>
      </div>
      <OpenInApp />
    </>
  );
};

export default Seller;
