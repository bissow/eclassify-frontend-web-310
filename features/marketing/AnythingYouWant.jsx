"use client";
import { useEffect, useState } from "react";
import Img1 from "@/public/assets/Image1.png";
import Img2 from "@/public/assets/Image2.png";
import Img3 from "@/public/assets/Image3.png";
import Img4 from "@/public/assets/Image4.png";
import Img5 from "@/public/assets/Image5.png";
import Img6 from "@/public/assets/Image6.png";
import { getCityDataClient, getKmRangeClient, saveCity } from "@/lib/location";
import { useSelector } from "react-redux";
import { useIsBrowserSupported } from "@/hooks/useIsBrowserSupported";
import { useTranslation } from "@/lang/useTranslation";
import LocationModal from "@/features/location/LocationModal";
import { toast } from "sonner";
import { getCompanyName } from "@/store/slices/settingSlice";
import CustomLink from "@/components/common/CustomLink";
import { VISITED_LANDING_COOKIE, VISITED_LANDING_COOKIE_MAX_AGE_SECONDS } from "@/lib/constants";
import CustomImage from "@/components/common/CustomImage";
import LandingAdEditSearchAutocomplete from "@/features/location/LandingAdEditSearchAutocomplete";
import { useNavigate } from "@/hooks/useNavigate";
import { ArrowRightIcon, GpsFixIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";

const AnythingYouWant = () => {
  const companyName = useSelector(getCompanyName);
  const [selectedCity, setSelectedCity] = useState(getCityDataClient);
  const IsBrowserSupported = useIsBrowserSupported();
  const { t } = useTranslation();
  const [IsLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const { navigate } = useNavigate();

  useEffect(() => {
    document.cookie = `${VISITED_LANDING_COOKIE}=1; path=/; max-age=${VISITED_LANDING_COOKIE_MAX_AGE_SECONDS}`;
  }, []);

  const handleSearchLocation = () => {
    const isInvalidLocation =
      getKmRangeClient() > 0
        ? !selectedCity?.lat || !selectedCity?.long
        : !selectedCity?.areaId &&
        !selectedCity?.city &&
        !selectedCity?.state &&
        !selectedCity?.country;

    if (isInvalidLocation) {
      toast.error(t("pleaseSelectLocation"));
      return;
    }
    saveCity(selectedCity);
    navigate("/");
  };

  return (
    <>
      <section
        id="anythingYouWant"
        className="py-28 bg-muted flex items-center justify-center"
      >
        <div className="container relative">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex flex-col items-center font-bold text-4xl lg:text-5xl gap-3 relative">
              <h1 className="flex flex-column items-center relative z-10 after:content-[''] after:absolute after:bg-primary after:h-[40%] after:w-full after:z-[-1] after:bottom-0">
                {t("buySell")}
              </h1>
              <h1>{t("anythingYouWant")}</h1>
            </div>
            <p className="text-sm font-light md:w-1/2">
              {t("discoverEndlessPossibilitiesAt")} {companyName}{" "}
              {t("goToMarketplace")}
            </p>
            <div className="space-between gap-3 rounded border w-full lg:w-[60%] bg-white py-2 ltr:pr-2 rtl:pl-2 relative">
              <LandingAdEditSearchAutocomplete
                saveOnSuggestionClick={false}
                setSelectedLocation={setSelectedCity}
              />
              <div className="flex items-center gap-3">
                {IsBrowserSupported && (
                  <button
                    className="flex items-center gap-2"
                    onClick={() => setIsLocationModalOpen(true)}
                  >
                    <GpsFixIcon size={22} weight="fill" />
                  </button>
                )}
                <button
                  className="flex items-center gap-2 bg-primary px-3 py-1.5 rounded text-white"
                  onClick={handleSearchLocation}
                >
                  <MagnifyingGlassIcon size={22} weight="bold" />
                  <span className="hidden md:block">{t("search")}</span>
                </button>
              </div>
              <CustomLink
                href="/"
                className="hidden sm:flex items-center gap-2 text-destructive"
              >
                <span className="whitespace-nowrap">{t("skip")}</span>
                <ArrowRightIcon size={16} className="rtl:scale-x-[-1]" weight="bold" />
              </CustomLink>
            </div>
            <CustomLink
              href="/"
              className="sm:hidden flex items-center gap-2 text-destructive"
            >
              <span className="whitespace-nowrap">{t("skip")}</span>
              <ArrowRightIcon size={16} className="rtl:scale-x-[-1]" weight="bold" />
            </CustomLink>
          </div>
          <CustomImage
            src={Img1}
            className="hidden xl:block absolute xl:-top-[38%] xl:ltr:left-[3%] xl:rtl:right-[3%] xl:w-27.5 rounded-full"
            height={135}
            width={90}
            alt="landing page image 1"
          />
          <CustomImage
            src={Img2}
            className="hidden xl:block absolute xl:top-[38%] xl:ltr:left-[9%] xl:rtl:right-[9%] xl:w-27.5 rounded-full"
            height={135}
            width={90}
            alt="landing page image 2"
          />
          <CustomImage
            src={Img3}
            className="hidden xl:block absolute xl:top-[120%] xl:ltr:left-[3%] xl:rtl:right-[3%] xl:w-27.5 rounded-full"
            height={90}
            width={90}
            alt="landing page image 3"
          />
          <CustomImage
            src={Img4}
            className="hidden xl:block absolute xl:-top-[38%] xl:ltr:right-[3%] xl:rtl:left-[3%] xl:w-27.5 rounded-full"
            height={135}
            width={90}
            alt="landing page image 4"
          />
          <CustomImage
            src={Img5}
            className="hidden xl:block absolute xl:top-[38%] xl:ltr:right-[9%] xl:rtl:left-[9%] xl:w-27.5 rounded-full"
            height={90}
            width={90}
            alt="landing page image 5"
          />
          <CustomImage
            src={Img6}
            className="hidden xl:block absolute xl:top-[109%] xl:ltr:right-[3%] xl:rtl:left-[3%] xl:w-27.5 rounded-full"
            height={0}
            width={0}
            alt="landing page image 6"
          />
        </div>
      </section>
      <LocationModal
        key={`${IsLocationModalOpen}-location-modal`}
        IsLocationModalOpen={IsLocationModalOpen}
        setIsLocationModalOpen={setIsLocationModalOpen}
      />
    </>
  );
};

export default AnythingYouWant;
