import { useEffect, useRef, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useSelector } from "react-redux";
import { getIsRtl } from "@/store/slices/languageSlice";
import ReactPlayer from "react-player";
import { getPlaceholderImage } from "@/store/slices/settingSlice";
import CustomImage from "@/components/common/CustomImage";
import { ArrowLeftIcon, ArrowRightIcon, PlayCircleIcon } from "@phosphor-icons/react";
import CustomLink from "@/components/common/CustomLink";
import { useTranslation } from "@/lang/useTranslation";

const AdGallery = ({ galleryImages, videoData, reelThumbnail, reelId, isOwner }) => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0); // -1 means video
  const carouselApi = useRef(null);
  const isRTL = useSelector(getIsRtl);
  const placeHolderImage = useSelector(getPlaceholderImage);

  const hasVideo = videoData?.url;
  const reelHref = isOwner ? `/reel/${reelId}?owner=1` : `/reel/${reelId}`;

  useEffect(() => {
    if (!carouselApi.current) return;
    // If no video, we use this normally
    const handleSelect = () => {
      const index = carouselApi.current.selectedScrollSnap();
      setSelectedIndex(index);
    };
    carouselApi.current.on("select", handleSelect);
    setSelectedIndex(carouselApi.current.selectedScrollSnap());

    return () => {
      carouselApi.current?.off("select", handleSelect);
    };
  }, []);

  const handlePrevImage = () => {
    if (!carouselApi.current) return;
    if (selectedIndex === -1) {
      // From video, go to last image
      const lastImageIndex = galleryImages.length - 1;
      carouselApi.current.scrollTo(lastImageIndex);
      setSelectedIndex(lastImageIndex);
    } else if (selectedIndex === 0) {
      if (hasVideo) {
        setSelectedIndex(-1);
      } else {
        const lastIndex = galleryImages.length - 1;
        carouselApi.current.scrollTo(lastIndex);
        setSelectedIndex(lastIndex);
      }
    } else {
      const newIndex = selectedIndex - 1;
      carouselApi.current.scrollTo(newIndex);
      setSelectedIndex(newIndex);
    }
  };


  const handleNextImage = () => {
    if (!carouselApi.current) return;
    if (selectedIndex === -1) {
      // From video, go to first image
      carouselApi.current.scrollTo(0);
      setSelectedIndex(0);
    } else if (selectedIndex === galleryImages.length - 1) {
      // From last image, go to video
      if (hasVideo) {
        // Go to video
        setSelectedIndex(-1);
      } else {
        // Loop to first image
        carouselApi.current.scrollTo(0);
        setSelectedIndex(0);
      }
    } else {
      const newIndex = (selectedIndex + 1) % galleryImages.length;
      carouselApi.current.scrollTo(newIndex);
      setSelectedIndex(newIndex);
    }
  };

  const handleImageClick = (index) => {
    setSelectedIndex(index);
  };

  return (
    <PhotoProvider>
      <div className="bg-muted rounded-lg relative">
        {selectedIndex === -1 ? (
          <ReactPlayer
            url={videoData.url}
            controls
            playing={false}
            className="aspect-870/500 rounded-lg"
            width="100%"
            height="100%"
            config={{
              file: {
                attributes: { controlsList: "nodownload" },
              },
            }}
          />
        ) : (
          <PhotoView
            src={galleryImages[selectedIndex]?.image || placeHolderImage}
            index={selectedIndex}
            key={selectedIndex}
          >
            <CustomImage
              src={galleryImages[selectedIndex]?.image}
              alt="Product Detail"
              width={870}
              height={500}
              className="h-full w-full object-center object-contain rounded-lg aspect-870/500 cursor-pointer"
            />
          </PhotoView>
        )}
        {reelThumbnail && reelId && (
          <CustomLink
            href={reelHref}
            className="absolute bottom-3 right-3 flex flex-col items-center z-10">
            <div className="relative size-14 sm:size-20 rounded-full overflow-hidden shadow-lg border border-white">
              <CustomImage
                src={reelThumbnail}
                alt="Reel"
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <PlayCircleIcon size={24} className="text-white" weight="fill" />
              </div>
            </div>
            <span className="bg-white text-black text-xs font-medium px-2 py-0.5 rounded-full shadow -mt-3 z-10">
              {t("videoAd")}
            </span>
          </CustomLink>
        )}
      </div>
      <div className="relative">
        <Carousel
          key={isRTL ? "rtl" : "ltr"}
          opts={{
            align: "start",
            containScroll: "trim",
            direction: isRTL ? "rtl" : "ltr",
          }}
          className="w-full"
          setApi={(api) => {
            carouselApi.current = api;
          }}
        >
          <CarouselContent className="md:-ml-[20px]">
            {galleryImages?.map((item, index) => (
              <CarouselItem key={index} className="basis-auto md:pl-[20px]">
                <PhotoView src={item?.image} index={index} className="hidden" />
                <CustomImage
                  src={item?.image}
                  alt="Product Detail"
                  height={120}
                  width={120}
                  className={`w-[100px] sm:w-[120px] aspect-square object-cover rounded-lg cursor-pointer ${selectedIndex === index ? "border-2 border-primary" : ""
                    }`}
                  onClick={() => handleImageClick(index)}
                />
              </CarouselItem>
            ))}
            {hasVideo &&
              <CarouselItem className="basis-auto md:pl-[20px]">
                <div
                  className={`relative w-[100px] sm:w-[120px] aspect-square rounded-lg cursor-pointer ${selectedIndex === -1 ? "border-2 border-primary" : ""
                    }`}
                  onClick={() => setSelectedIndex(-1)}
                >
                  {videoData?.isFile ? (
                    <video
                      src={`${videoData.url}#t=0.5`}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : videoData?.thumbnail ? (
                    <CustomImage
                      src={videoData.thumbnail}
                      alt="Video Thumbnail"
                      height={120}
                      width={120}
                      className="w-full h-full object-cover rounded-lg"
                      key={videoData.thumbnail}
                    />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-muted" />
                  )}
                  <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                    <PlayCircleIcon size={40} className="text-white" weight="fill" />
                  </div>
                </div>
              </CarouselItem>
            }
          </CarouselContent>
          {
            galleryImages.length > 1 &&
            <>
              <div className="hidden lg:block absolute top-1/2 ltr:left-0 ltr:-translate-x-1/2 rtl:right-0 rtl:translate-x-1/2 -translate-y-1/2">
                <button
                  onClick={handlePrevImage}
                  className="bg-primary p-1 sm:p-2 rounded-full"
                >
                  <ArrowLeftIcon size={18} color='white' className={isRTL ? "rotate-180" : ""} weight="bold" />
                </button>
              </div>
              <div className="hidden lg:block absolute top-1/2 ltr:right-0 ltr:translate-x-1/2 rtl:left-0 rtl:-translate-x-1/2 -translate-y-1/2">
                <button
                  onClick={handleNextImage}
                  className="bg-primary p-1 sm:p-2 rounded-full"
                >
                  <ArrowRightIcon
                    size={18}
                    color="white"
                    className={isRTL ? "rotate-180" : ""}
                    weight="bold"
                  />
                </button>
              </div>
            </>
          }
        </Carousel>
      </div>
    </PhotoProvider>
  );
};
export default AdGallery;
