"use client";

import { useEffect, useState, useTransition, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { sellerQrApi } from "@/lib/api";
import LocationMismatchAlert from "@/components/seller-qr/LocationMismatchAlert";
import StoreHeroHeader from "@/components/seller-qr/StoreHeroHeader";
import CatalogFilterBar from "@/components/seller-qr/CatalogFilterBar";
import AdCard from "@/components/common/AdCard";
import AdCardSkeleton from "@/components/common/AdCardSkeleton";
import NoData from "@/components/empty-states/NoData";
import Pagination from "@/components/common/Pagination";
import OpenInApp from "@/components/common/OpenInApp";
import BreadCrumb from "@/components/common/BreadCrumb";
import { CircleNotchIcon, ArrowClockwiseIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "use-debounce";

export default function StoreQrPage({ params }) {
  const unwrappedParams = use(params);
  const token = unwrappedParams?.token;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 400);
  const [activeCategory, setActiveCategory] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Geolocation state
  const [userCoords, setUserCoords] = useState(null);

  // 1. Silent Geolocation Request
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          // Gracefully continue without GPS
          console.log("Geolocation prompt dismissed or unavailable:", err.message);
        },
        { timeout: 7000, maximumAge: 120000 }
      );
    }
  }, []);

  // 2. Fetch Catalog Data from API
  const fetchCatalog = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await sellerQrApi.getStoreByQr({
        identifier: token,
        latitude: userCoords?.lat,
        longitude: userCoords?.lng,
        category_id: activeCategory || undefined,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        page: currentPage,
        limit: 16,
      });

      if (res?.data && res?.data?.error === false) {
        setData(res.data.data);
      } else {
        setErrorMsg(res?.data?.message || "Unable to load store catalog.");
      }
    } catch (err) {
      console.error("Error loading QR catalog:", err);
      setErrorMsg(
        err?.response?.data?.message || "Store not found or QR code is inactive."
      );
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when token, coords, category, search, sort, or page changes
  useEffect(() => {
    fetchCatalog();
  }, [token, userCoords, activeCategory, debouncedSearch, sortBy, currentPage]);

  const store = data?.store;
  const rawItems = data?.items?.data ?? data?.items;
  const items = Array.isArray(rawItems)
    ? rawItems
    : rawItems && typeof rawItems === "object"
    ? [rawItems]
    : [];
  const categories = Array.isArray(data?.categories) ? data.categories : [];
  const pagination = data?.items;
  const locationWarning = data?.location_warning;

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Smart Mobile Prompt */}
      <OpenInApp enabled={true} />

      <div className="container mx-auto px-4 pt-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <BreadCrumb
          items={[
            { name: "Stores", href: "/stores" },
            { name: store?.name || "Store Catalog" },
          ]}
        />

        {/* Loading Spinner */}
        {loading && !data && (
          <div className="flex min-h-[420px] flex-col items-center justify-center gap-3">
            <CircleNotchIcon className="h-9 w-9 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              Loading store catalog & verifying location...
            </p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && errorMsg && (
          <div className="mx-auto my-12 max-w-md text-center">
            <NoData
              title="Store Not Available"
              description={errorMsg}
            />
            <Button
              variant="outline"
              onClick={fetchCatalog}
              className="mt-6 gap-2"
            >
              <ArrowClockwiseIcon size={16} weight="bold" />
              Try Again
            </Button>
          </div>
        )}

        {/* Loaded Content */}
        {data && store && (
          <div className="mt-4 space-y-6">
            {/* Non-blocking Location Discrepancy Alert */}
            {locationWarning?.warning && (
              <LocationMismatchAlert
                warningData={locationWarning}
                className="animate-in fade-in duration-300"
              />
            )}

            {/* Store Hero Profile */}
            <StoreHeroHeader
              store={store}
              totalItems={pagination?.total ?? items.length}
            />

            {/* Catalog Search & Category Filter Bar */}
            <CatalogFilterBar
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={(catId) => {
                setActiveCategory(catId);
                setCurrentPage(1);
              }}
              searchQuery={searchQuery}
              onSearchChange={(query) => {
                setSearchQuery(query);
                setCurrentPage(1);
              }}
              sortBy={sortBy}
              onSortChange={(sort) => {
                setSortBy(sort);
                setCurrentPage(1);
              }}
              totalCount={pagination?.total ?? items.length}
            />

            {/* Items Grid */}
            {loading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <AdCardSkeleton key={idx} />
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((item) => (
                  <AdCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border bg-card py-16 text-center">
                <NoData
                  title="No Items Found"
                  description={
                    searchQuery || activeCategory
                      ? "No products match your selected filters. Try searching for something else."
                      : "This seller has not listed any active items yet."
                  }
                />
              </div>
            )}

            {/* Pagination */}
            {pagination?.last_page > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.last_page}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}

            {/* Catalog Footer Platform Branding */}
            <div className="mt-12 border-t pt-6 text-center">
              {data?.settings?.footer_logo_url && (
                <div className="mb-2 flex justify-center">
                  <img
                    src={data.settings.footer_logo_url}
                    alt="Platform Logo"
                    className="h-6 max-w-[120px] object-contain opacity-80"
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {data?.settings?.default_footer_text || "Powered by Bissow.com"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
