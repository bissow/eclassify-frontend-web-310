"use client";
import ProviderMap from "@/components/common/ProviderMap";

const containerStyle = {
  width: "100%",
  height: "200px",
  zIndex: 0,
};

const Map = ({ latitude, longitude }) => {
  // Validate latitude and longitude
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  const isValidLat = !isNaN(lat) && lat >= -90 && lat <= 90;
  const isValidLng = !isNaN(lng) && lng >= -180 && lng <= 180;

  if (!isValidLat || !isValidLng) return null;

  return (
    <ProviderMap
      position={{ lat, lng }}
      zoom={10}
      containerStyle={containerStyle}
      interactive={false}
    />
  );
};

export default Map;
