import { useSelector } from "react-redux";
import {
  getDefaultLatitude,
  getDefaultLongitude,
} from "@/store/slices/settingSlice";
import ProviderMap from "@/components/common/ProviderMap";

const containerStyle = {
  width: "100%",
  height: "400px",
  zIndex: 0,
};

const MapComponent = ({ getLocationWithMap, location }) => {
  const latitude = useSelector(getDefaultLatitude);
  const longitude = useSelector(getDefaultLongitude);

  const position = {
    lat: Number(location?.lat) || latitude,
    lng: Number(location?.long) || longitude,
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
      position={position}
      containerStyle={containerStyle}
      onMapClick={handleMapClick}
    />
  );
};

export default MapComponent;
