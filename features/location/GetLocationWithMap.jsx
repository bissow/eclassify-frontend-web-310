import { useSelector } from "react-redux";
import {
  getDefaultLatitude,
  getDefaultLongitude,
} from "@/store/slices/settingSlice";
import { getCityDataClient } from "@/lib/location";
import ProviderMap from "@/components/common/ProviderMap";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "4px",
};

const GetLocationWithMap = ({ position, getLocationWithMap, KmRange }) => {
  const latitude = useSelector(getDefaultLatitude);
  const longitude = useSelector(getDefaultLongitude);
  const globalPos = getCityDataClient();

  const placeHolderPos = {
    lat: globalPos?.lat,
    lng: globalPos?.long,
  };

  const markerLatLong =
    position?.lat && position?.lng ? position : placeHolderPos;

  const resolvedPosition = {
    lat: markerLatLong?.lat || latitude,
    lng: markerLatLong?.lng || longitude,
  };

  const handleMapClick = (latlng) => {
    if (getLocationWithMap) {
      getLocationWithMap({
        lat: latlng.lat,
        lng: latlng.lng,
      });
    }
  };

  return (
    <ProviderMap
      position={resolvedPosition}
      containerStyle={containerStyle}
      onMapClick={handleMapClick}
      radiusMeters={KmRange * 1000}
    />
  );
};

export default GetLocationWithMap;
