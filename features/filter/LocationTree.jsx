"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import LocationModal from "@/features/location/LocationModal";
import { useTranslation } from "@/lang/useTranslation";
import { MapPinIcon } from "@phosphor-icons/react";

const LocationTree = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const country = searchParams.get("country");
  const state = searchParams.get("state");
  const city = searchParams.get("city");
  const area = searchParams.get("area");
  const location = searchParams.get("location");

  const locationText = location || [area, city, state, country].filter(Boolean).join(", ") || t("addLocation");

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex items-center gap-2 p-3 border rounded-md bg-muted/30 cursor-pointer hover:bg-muted transition-colors"
        onClick={() => setIsLocationModalOpen(true)}
      >
        <MapPinIcon className="text-primary shrink-0" weight="bold" size={18} />
        <span className="text-sm font-medium truncate" title={locationText}>
          {locationText}
        </span>
      </div>

      <LocationModal
        IsLocationModalOpen={isLocationModalOpen}
        setIsLocationModalOpen={setIsLocationModalOpen}
        shouldSaveToRedux={false}
        key={`${isLocationModalOpen}-filter-location-modal`}
      />
    </div>
  );
};

export default LocationTree;
