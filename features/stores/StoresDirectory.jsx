"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lang/useTranslation";
import { storesApi } from "@/lib/api";
import StoreCard from "./StoreCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { getCityDataClient, getKmRangeClient } from "@/lib/location";
import { CircleNotchIcon, MagnifyingGlassIcon, MapPinIcon, SlidersHorizontalIcon, StorefrontIcon } from "@phosphor-icons/react";
import LocationModal from "@/features/location/LocationModal";
import NoData from "@/components/empty-states/NoData";
import { useDebounce } from "use-debounce";

const StoresDirectory = () => {
  const { t } = useTranslation();
  const [stores, setStores] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadMore, setIsLoadMore] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [sortBy, setSortBy] = useState("nearest");
  const [radius, setRadius] = useState(getKmRangeClient() || 50);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [cityData, setCityData] = useState(getCityDataClient());

  const fetchStores = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadMore(true);

      const location = getCityDataClient();
      const currentRadius = getKmRangeClient() || radius;

      const params = {
        page: pageNum,
        limit: 12,
        sort_by: sortBy,
        search: debouncedSearch || undefined,
        radius: currentRadius || undefined,
      };

      if (location?.lat && location?.long) {
        params.latitude = location.lat;
        params.longitude = location.long;
      }
      if (location?.city) params.city = location.city;
      if (location?.state) params.state = location.state;
      if (location?.country) params.country = location.country;
      if (location?.areaId) params.area_id = location.areaId;

      const res = await storesApi.getStores(params);

      if (res?.data?.error === false) {
        const data = res?.data?.data;
        if (append) {
          setStores((prev) => [...prev, ...(data?.data || [])]);
        } else {
          setStores(data?.data || []);
        }
        setTotal(data?.total || 0);
        setPage(data?.current_page || 1);
        setLastPage(data?.last_page || 1);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setIsLoading(false);
      setIsLoadMore(false);
    }
  };

  useEffect(() => {
    setCityData(getCityDataClient());
    fetchStores(1, false);
  }, [debouncedSearch, sortBy]);

  const handleLocationSelected = () => {
    setCityData(getCityDataClient());
    fetchStores(1, false);
  };

  const formattedLocationName = [cityData?.area, cityData?.city, cityData?.state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header & Title */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
            <StorefrontIcon className="h-9 w-9 text-primary" />
            {t("storesDirectory") || "Stores & Nearby Sellers"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("storesDirectorySubtitle") || "Discover top-rated local shops, trusted sellers, and exclusive nearby stores."}
          </p>
        </div>

        {/* Location selector chip */}
        <Button
          variant="outline"
          onClick={() => setIsLocationModalOpen(true)}
          className="flex items-center gap-2 rounded-xl border-border bg-card px-4 py-2 text-sm shadow-sm hover:border-primary"
        >
          <MapPinIcon weight="fill" className="h-4 w-4 text-primary" />
          <span className="max-w-[200px] truncate font-medium text-foreground">
            {formattedLocationName || t("allLocations") || "Select Location"}
          </span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-center">
          {/* Search Input */}
          <div className="relative md:col-span-6">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchStorePlaceholder") || "Search stores by name, city, or items..."}
              className="pl-9"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder={t("sortBy") || "Sort By"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nearest">{t("nearest") || "Nearest First"}</SelectItem>
                <SelectItem value="top_rated">{t("topRated") || "Top Rated"}</SelectItem>
                <SelectItem value="popular">{t("mostItems") || "Most Items"}</SelectItem>
                <SelectItem value="newest">{t("newest") || "Newest"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Radius Selector */}
          <div className="flex items-center gap-3 md:col-span-3">
            <SlidersHorizontalIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{t("radius") || "Radius"}</span>
                <span className="font-semibold text-primary">{radius} km</span>
              </div>
              <Slider
                value={[radius]}
                min={5}
                max={100}
                step={5}
                onValueChange={(val) => setRadius(val[0])}
                onValueCommit={() => fetchStores(1, false)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stores List Grid */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <CircleNotchIcon className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : stores.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>

          {/* Load More Button */}
          {page < lastPage && (
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                disabled={isLoadMore}
                onClick={() => fetchStores(page + 1, true)}
                className="min-w-[160px]"
              >
                {isLoadMore ? (
                  <CircleNotchIcon className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {t("loadMore") || "Load More Stores"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="my-12">
          <NoData
            title={t("noStoresFound") || "No Stores Found"}
            description={t("noStoresDescription") || "Try changing your search terms, radius, or selected location."}
          />
        </div>
      )}

      {/* Central Location Modal Integration */}
      <LocationModal
        IsOpen={isLocationModalOpen}
        OnHide={() => {
          setIsLocationModalOpen(false);
          handleLocationSelected();
        }}
      />
    </div>
  );
};

export default StoresDirectory;
