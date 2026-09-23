import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Circle, MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { CircleF, GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { getIsPaidApi } from "@/store/slices/settingSlice";
import { Skeleton } from "@/components/ui/skeleton";

// app/[lang]/layout.jsx sets --primary (not --primary-color) from the admin theme color.
const getPrimaryColor = () =>
  typeof document !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()
    : "#3388ff"; // Leaflet's own default marker/circle color, used as a server-render-safe fallback

// Same pin shape as Leaflet's default marker icon (below), recolored to the theme's primary color.
const pinDataUri = (color) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path fill="${color}" d="M12.5 0C5.6 0 0 5.6 0 12.5 0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"/><circle cx="12.5" cy="12.5" r="5" fill="#fff"/></svg>`
  )}`;

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => onMapClick(e.latlng),
  });
  return null;
};

const LeafletProviderMap = ({
  position, zoom, containerStyle, onMapClick, radiusMeters, radiusColor, interactive,
}) => {
  const mapRef = useRef();

  useEffect(() => {
    if (mapRef.current && position?.lat && position?.lng) {
      mapRef.current.flyTo([position.lat, position.lng], mapRef.current.getZoom());
    }
  }, [position?.lat, position?.lng]);

  return (
    <MapContainer
      style={containerStyle}
      center={[position?.lat, position?.lng]}
      zoom={zoom}
      ref={mapRef}
      whenCreated={(mapInstance) => {
        mapRef.current = mapInstance;
      }}
      scrollWheelZoom={interactive}
      zoomControl={interactive}
      attributionControl={interactive}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      {position?.lat && position?.lng && (
        <Marker
          position={[position.lat, position.lng]}
          icon={L.icon({ iconUrl: pinDataUri(radiusColor), iconSize: [25, 41], iconAnchor: [12, 41] })}
        />
      )}
      {radiusMeters > 0 && position?.lat && position?.lng && (
        <Circle
          center={[position.lat, position.lng]}
          radius={radiusMeters}
          pathOptions={{ color: radiusColor, fillColor: radiusColor, fillOpacity: 0.2 }}
        />
      )}
    </MapContainer>
  );
};

const GoogleProviderMap = ({
  position, zoom, containerStyle, onMapClick, radiusMeters, radiusColor, interactive,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });
  const mapRef = useRef();

  useEffect(() => {
    if (mapRef.current && position?.lat && position?.lng) {
      mapRef.current.panTo({ lat: position.lat, lng: position.lng });
    }
  }, [position?.lat, position?.lng]);

  if (!isLoaded) return <Skeleton style={containerStyle} />;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: position?.lat, lng: position?.lng }}
      zoom={zoom}
      onLoad={(map) => {
        mapRef.current = map;
      }}
      onClick={onMapClick ? (e) => onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() }) : undefined}
      options={{ scrollwheel: interactive, zoomControl: interactive, fullscreenControl: false, streetViewControl: false, mapTypeControl: false }}
    >
      {position?.lat && position?.lng && (
        <MarkerF
          position={{ lat: position.lat, lng: position.lng }}
          icon={{
            url: pinDataUri(radiusColor),
            scaledSize: new window.google.maps.Size(25, 41),
            anchor: new window.google.maps.Point(12, 41),
          }}
        />
      )}
      {radiusMeters > 0 && position?.lat && position?.lng && (
        <CircleF
          center={{ lat: position.lat, lng: position.lng }}
          radius={radiusMeters}
          options={{ strokeColor: radiusColor, fillColor: radiusColor, fillOpacity: 0.2 }}
        />
      )}
    </GoogleMap>
  );
};

// Renders Leaflet/OpenStreetMap or Google Maps based on the admin's map_provider
// setting (getIsPaidApi) — the single place that decision is made; every map on
// the site (click-to-pick, km-range radius, static pin) renders through this.
const ProviderMap = ({
  position,
  zoom = 6,
  containerStyle,
  onMapClick,
  radiusMeters = 0,
  radiusColor,
  interactive = true,
}) => {
  const isGoogleMap = useSelector(getIsPaidApi);
  const props = {
    position, zoom, containerStyle, onMapClick, radiusMeters, interactive,
    radiusColor: radiusColor || getPrimaryColor(),
  };

  return isGoogleMap ? <GoogleProviderMap {...props} /> : <LeafletProviderMap {...props} />;
};

export default ProviderMap;
