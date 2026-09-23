import dynamic from "next/dynamic";
import { useTranslation } from "@/lang/useTranslation";
import { MapPinIcon } from "@phosphor-icons/react";

const Map = dynamic(() => import("@/features/location/Map"), {
  ssr: false,
});

const AdLocation = ({ productDetails }) => {
  const { t } = useTranslation();
  const address = productDetails?.translated_item?.address || productDetails?.address;

  const handleShowMapClick = () => {
    const googleMapsUrl = `https://www.google.com/maps?q=${address}&ll=${productDetails?.latitude},${productDetails?.longitude}&z=12&t=m`;
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <div className="flex flex-col border rounded-lg ">
      <div className="p-4">
        <p className="font-bold">{t("postedIn")}</p>
      </div>
      <div className="border-b w-full"></div>
      <div className="flex flex-col p-4 gap-4">
        <div className="flex items-start gap-2">
          <MapPinIcon size={22} />
          <p className="w-full overflow-hidden text-ellipsis">
            {address}
          </p>
        </div>
        <div className="rounded-lg overflow-hidden">
          <Map
            latitude={productDetails?.latitude}
            longitude={productDetails?.longitude}
          />
        </div>
        <div>
          <button
            className="border px-4 py-2 rounded-md w-full flex items-center gap-2 text-base  justify-center"
            onClick={handleShowMapClick}
          >
            {t("showOnMap")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdLocation;
