import { useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import ManualAddress from "@/features/listing/shared/ManualAddress";
import { useIsBrowserSupported } from "@/hooks/useIsBrowserSupported";
import { getIsPaidApi } from "@/store/slices/settingSlice";
import { useTranslation } from "@/lang/useTranslation";
import LandingAdEditSearchAutocomplete from "@/features/location/LandingAdEditSearchAutocomplete";
import useGetLocation from "@/components/layout/useGetLocation";
import { CircleNotchIcon, GpsFixIcon, MapPinAreaIcon, MapPinIcon } from "@phosphor-icons/react";

const MapComponent = dynamic(() => import("@/components/common/MapComponent"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[400px] rounded-lg" />,
});

// Shared location step for both create (AdsListing) and edit (EditListing) flows.
// The only difference between the two was the heading text, exposed via `title`.
const ListingLocation = ({
  location,
  setLocation,
  onSubmit,
  isAdPlaced,
  handleGoBack,
  title,
}) => {
  const { t } = useTranslation();
  // Default resolved here, not in the param list — parameter scope closes
  // before the body runs, so it can't see the hook's `t`.
  const heading = title ?? t("addLocation");
  const [showManualAddress, setShowManualAddress] = useState(false);
  const isBrowserSupported = useIsBrowserSupported();
  const [IsGettingCurrentLocation, setIsGettingCurrentLocation] =
    useState(false);
  const IsPaidApi = useSelector(getIsPaidApi);
  const { fetchLocationData } = useGetLocation();

  const getLocationWithMap = async (pos) => {
    try {
      const data = await fetchLocationData(pos);
      setLocation(data);
    } catch (error) {
      console.error("Error fetching location data:", error);
      toast.error(t("errorOccurred"));
    }
  };

  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      setIsGettingCurrentLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const data = await fetchLocationData({ lat: latitude, lng: longitude });
            setLocation(data);
          } catch (error) {
            console.error("Error fetching location data:", error);
            toast.error(t("errorOccurred"));
          } finally {
            setIsGettingCurrentLocation(false);
          }
        },
        (error) => {
          toast.error(t("locationNotGranted"));
          setIsGettingCurrentLocation(false);
        }
      );
    } else {
      toast.error(t("geoLocationNotSupported"));
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <h5 className="hidden sm:block text-xl font-medium">{heading}</h5>
          <div className="flex items-center gap-2 border rounded-md w-full md:w-96 min-h-[42px]">
            <LandingAdEditSearchAutocomplete
              saveOnSuggestionClick={false}
              setSelectedLocation={setLocation}
            />
            {isBrowserSupported && (
              <button
                onClick={getCurrentLocation}
                disabled={IsGettingCurrentLocation}
                className="bg-primary p-2 text-white gap-2 flex items-center rounded-md h-10"
              >
                <span>
                  {IsGettingCurrentLocation ? (
                    <CircleNotchIcon className="size-4! animate-spin" weight="bold" />
                  ) : (
                    <GpsFixIcon size={16} weight="bold" />
                  )}
                </span>
                <span className="whitespace-nowrap hidden md:inline">
                  {IsGettingCurrentLocation ? t("loading") : t("locateMe")}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-8 flex-col">
          <MapComponent
            location={location}
            getLocationWithMap={getLocationWithMap}
          />
          <div className="flex items-center gap-3 bg-muted rounded-lg p-4  ">
            <div className="p-5 rounded-md bg-white">
              <MapPinAreaIcon className="text-primary" size={32} weight="bold" />
            </div>
            <span className="flex flex-col gap-1">
              <h6 className="font-medium">{t("address")}</h6>
              {location?.address_translated || location?.formattedAddress ? (
                <p>
                  {location?.address_translated || location?.formattedAddress}
                </p>
              ) : (
                t("addYourAddress")
              )}
            </span>
          </div>
        </div>
        {!IsPaidApi && (
          <>
            <div className="relative flex items-center justify-center">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-[#d3d3d3]"></div>
              <div className="relative bg-muted text-black text-base font-medium rounded-full w-12 h-12 flex items-center justify-center uppercase">
                {t("or")}
              </div>
            </div>
            <div className="flex flex-col gap-3 items-center justify-center">
              <p className="text-xl font-semibold text-center">
                {t("whatLocAdYouSelling")}
              </p>
              <button
                className="p-2 flex items-center gap-2 border rounded-md font-medium"
                onClick={() => setShowManualAddress(true)}
              >
                <MapPinIcon size={20} />
                {t("addLocation")}
              </button>
            </div>
          </>
        )}
        <div className="flex justify-end gap-3">
          <button
            className="bg-black text-white px-4 py-2 rounded-md text-xl font-light"
            onClick={handleGoBack}
          >
            {t("back")}
          </button>
          <button
            className="bg-primary text-white px-4 py-2 rounded-md text-xl font-light disabled:bg-muted-foreground"
            disabled={isAdPlaced}
            onClick={onSubmit}
          >
            {isAdPlaced ? t("posting") : t("postNow")}
          </button>
        </div>
      </div>
      <ManualAddress
        key={showManualAddress}
        showManualAddress={showManualAddress}
        setShowManualAddress={setShowManualAddress}
        setLocation={setLocation}
      />
    </>
  );
};

export default ListingLocation;
