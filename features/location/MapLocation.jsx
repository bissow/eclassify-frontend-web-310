import { DialogTitle } from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { useTranslation } from "@/lang/useTranslation";
import SearchAutocomplete from "@/features/location/SearchAutocomplete";
import { useState } from "react";
import { getMaxRange, getMinRange } from "@/store/slices/settingSlice";
import { useSelector } from "react-redux";
import {
  getKmRangeClient,
  resetCityData,
  saveCity,
  saveKilometerRange,
} from "@/lib/location";
import { useIsBrowserSupported } from "@/hooks/useIsBrowserSupported";
import { Slider } from "@/components/ui/slider";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getIsRtl } from "@/store/slices/languageSlice";
import useGetLocation from "@/components/layout/useGetLocation";
import { useUpdateLocationInUrl } from "@/hooks/useUpdateLocationInUrl";
import { useSearchParams } from "next/navigation";
import { useNavigate } from "@/hooks/useNavigate";
import { ArrowLeftIcon, GpsFixIcon } from "@phosphor-icons/react";

const GetLocationWithMap = dynamic(() => import("@/features/location/GetLocationWithMap"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-[400px] rounded-lg" />,
});

const MapLocation = ({
  OnHide,
  selectedCity,
  setSelectedCity,
  setIsMapLocation,
  IsPaidApi,
  shouldSaveToRedux = true,
}) => {
  const searchParams = useSearchParams();
  const globalRadius = getKmRangeClient();
  const min_range = useSelector(getMinRange);
  const max_range = useSelector(getMaxRange);
  const IsBrowserSupported = useIsBrowserSupported();


  // 2. Get local URL value (for Ads page)
  const urlRadius = Number(searchParams.get("km_range")) || 0;
  const initialRadius = shouldSaveToRedux ? globalRadius : urlRadius;
  const [KmRange, setKmRange] = useState(() => {
    // If we have a pre-filled range (initialRadius > 0), use it. 
    // Otherwise, default to min_range.
    const startValue = initialRadius > 0 ? initialRadius : min_range;

    // Clamp it purely to ensure it never breaks the slider bounds
    return Math.min(Math.max(startValue, min_range), max_range);
  });
  const [IsFetchingLocation, setIsFetchingLocation] = useState(false);

  const isRTL = useSelector(getIsRtl);
  const { fetchLocationData } = useGetLocation();
  const { t } = useTranslation();
  const { updateLocationInUrl } = useUpdateLocationInUrl();
  const { navigate } = useNavigate()

  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      setIsFetchingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const data = await fetchLocationData({ lat: latitude, lng: longitude });
            setSelectedCity(data);
          } catch (error) {
            console.error("Error fetching location data:", error);
            toast.error(t("errorOccurred"));
          } finally {
            setIsFetchingLocation(false);
          }
        },
        (error) => {
          console.log(error);
          toast.error(t("locationNotGranted"));
          setIsFetchingLocation(false);
        }
      );
    } else {
      toast.error(t("geoLocationNotSupported"));
    }
  };

  const getLocationWithMap = async (pos) => {
    try {
      const data = await fetchLocationData(pos);
      setSelectedCity(data);
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  const handleSave = () => {
    const isInvalidLocation = !selectedCity?.areaId && !selectedCity?.city && !selectedCity?.state && !selectedCity?.country;
    const isInvalidRange = Number(KmRange) > 0 && (!selectedCity?.areaId && !selectedCity?.city)

    if (isInvalidLocation) {
      toast.error(t("pleaseSelectLocation"));
      return;
    }
    if (isInvalidRange) {
      toast.error(t("pleaseSelectCityToApplyRange"));
      return;
    }
    const dataWithRange = { ...selectedCity, km_range: KmRange };
    if (shouldSaveToRedux) {
      saveKilometerRange(KmRange);
      saveCity(selectedCity);
      navigate('/');
    } else {
      updateLocationInUrl(dataWithRange);
    }
    toast.success(t("locationSaved"));
    OnHide();
  };

  const handleReset = () => {
    if (shouldSaveToRedux) {
      resetCityData();
      saveKilometerRange(min_range);
      navigate('/');
    } else {
      updateLocationInUrl({});
    }
    OnHide();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-semibold text-xl">
          {!IsPaidApi && (
            <button onClick={() => setIsMapLocation(false)}>
              <ArrowLeftIcon size={20} weight="bold" className="rtl:scale-x-[-1]" />
            </button>
          )}

          {selectedCity?.address_translated ||
            selectedCity?.formattedAddress ? (
            <p>
              {selectedCity?.address_translated ||
                selectedCity?.formattedAddress}
            </p>
          ) : (
            t("addYourAddress")
          )}
        </DialogTitle>
      </DialogHeader>
      <div className="flex items-center border rounded-md">
        <div className="flex-3 sm:flex-2">
          <SearchAutocomplete
            saveOnSuggestionClick={false}
            OnHide={OnHide}
            setSelectedLocation={setSelectedCity}
          />
        </div>

        {IsBrowserSupported && (
          <>
            <div className="border-r h-full" />
            <button
              className="flex-1 flex items-center justify-center"
              onClick={getCurrentLocation}
            >
              <div className="flex items-center gap-2 py-2 px-4">
                <GpsFixIcon size={20} weight="fill" className="size-5 shrink-0" />
                <span className="text-sm text-balance hidden sm:inline">
                  {IsFetchingLocation
                    ? t("gettingLocation")
                    : t("currentLocation")}
                </span>
              </div>
            </button>
          </>
        )}
      </div>
      <GetLocationWithMap
        KmRange={KmRange}
        position={{ lat: selectedCity?.lat, lng: selectedCity?.long }}
        getLocationWithMap={getLocationWithMap}
      />
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 justify-between">
          <span>{t("rangeLabel")}</span>
          <span>{KmRange} KM</span>
        </div>
        <Slider
          value={[KmRange]}
          onValueChange={(value) => setKmRange(value[0])}
          max={max_range}
          min={min_range}
          step={1}
          dir={isRTL ? "rtl" : "ltr"}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={handleReset}>
          {t("reset")}
        </Button>
        <Button onClick={handleSave}>{t("save")}</Button>
      </DialogFooter>
    </>
  );
};

export default MapLocation;
