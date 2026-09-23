import { memo, useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lang/useTranslation";
import CustomImage from "@/components/common/CustomImage";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { UploadSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import { getMaxGalleryImages, getReelMaxSize } from "@/store/slices/settingSlice";
import ImageGalleryModal from "@/features/listing/shared/ImageGalleryModal";
import { IMAGE_ACCEPT, VIDEO_ACCEPT } from "@/lib/constants";
import VideoPreviewCard from "@/features/listing/shared/VideoCard";
import EditVideoModal from "@/features/listing/shared/EditVideoModal";
import { processVideo } from "@/features/listing/lib/video";
import { AdVideoSection } from "@/features/listing/shared/ImageUpload";

const ImageCard = memo(({ file, index, onRemove, extraCount, onOpenModal }) => {
  const { t } = useTranslation();
  return (
  <div className="relative rounded-2xl overflow-hidden aspect-square w-full">
    <CustomImage
      fill
      className="object-cover"
      src={file.preview}
      alt={file.file?.name ?? String(index)}
    />
    {extraCount > 0 ? (
      <div
        className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
        onClick={onOpenModal}
      >
        <span className="text-white text-base sm:text-xl font-semibold">
          +{extraCount} {t("more")}
        </span>
      </div>
    ) : (
      <button
        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
        onClick={() => onRemove(index)}
      >
        <XIcon size={18} color="black" />
      </button>
    )}
    {index === 0 && (
      <Badge className="absolute bottom-2 left-2 bg-primary text-white">
        {t("cover")}
      </Badge>
    )}
  </div>
  );
});
ImageCard.displayName = "ImageCard";

const DropZoneContent = ({ isDragAccept }) => {
  const { t } = useTranslation();
  return isDragAccept ? (
    <span className="text-primary font-medium">{t("dropFiles")}</span>
  ) : (
    <div className="flex flex-col gap-2 items-center text-center">
      <span className="text-muted-foreground">{t("dragFiles")}</span>
      <span className="text-muted-foreground">{t("or")}</span>
      <div className="flex items-center gap-2 text-primary">
        <UploadSimpleIcon size={24} />
        <span className="font-medium">{t("upload")}</span>
      </div>
    </div>
  );
};

const EditImageUpload = ({
  OtherImages,
  setOtherImages,
  handleImageSubmit,
  handleGoBack,
  setDeleteImagesId,
  isReel,
  existingReel,
  videoData,
  setVideoData,
  defaultDetails,
  setTranslations,
  defaultLangId,
  trimVideo,
}) => {
  const { t } = useTranslation();
  const maxGalleryImages = useSelector(getMaxGalleryImages);
  const reelMaxSize = useSelector(getReelMaxSize);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [editVideoModalOpen, setEditVideoModalOpen] = useState(false);

  const revokeVideoBlobs = useCallback((data) => {
    if (!data) return;
    URL.revokeObjectURL(data.url);
    URL.revokeObjectURL(data.thumbnail);
    data.frames.forEach(URL.revokeObjectURL);
  }, []);

  const handleVideoSave = useCallback(({ thumbnail, thumbnailTime, trimStart, trimEnd, trimmedFile }) => {
    setVideoData((prev) => prev ? { ...prev, thumbnail, thumbnailTime, trimStart, trimEnd, trimmedFile } : prev);
  }, []);

  const onVideoDrop = useCallback(async ([file]) => {
    if (!file) return;
    setVideoLoading(true);
    try {
      const result = await processVideo(file, 6, t);
      if (!result) return;
      const { duration: rawDuration, firstFrame, frames } = result;
      const duration = Math.round(rawDuration * 10) / 10;
      setVideoData((prev) => {
        revokeVideoBlobs(prev);
        return { file, url: URL.createObjectURL(file), duration, thumbnail: firstFrame, frames };
      });
    } finally {
      setVideoLoading(false);
    }
  }, [revokeVideoBlobs]);

  const { getRootProps: getRootVideoProps, getInputProps: getInputVideoProps, isDragAccept: isVideoDragAccept } = useDropzone({
    accept: VIDEO_ACCEPT,
    multiple: false,
    disabled: videoLoading,
    onDrop: onVideoDrop,
    onDropRejected: () => toast.error(t("onlyMp4VideoSupported")),
  });

  const onImagesAccepted = useCallback((files) => {
    setOtherImages((prev) => [
      ...prev,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  }, []);

  const onOtherDrop = useCallback(
    (acceptedFiles) => {
      const remainingSlots = maxGalleryImages - OtherImages.length;
      if (remainingSlots === 0) {
        toast.error(t("imageLimitExceeded"));
        return;
      }
      if (acceptedFiles.length > remainingSlots) {
        toast.error(t("youCanUpload") + " " + remainingSlots + " " + t("moreImages"));
        return;
      }
      onImagesAccepted(acceptedFiles);
    },
    [OtherImages, maxGalleryImages, onImagesAccepted]
  );

  const { getRootProps: getRootImageProps, getInputProps: getInputImageProps, isDragAccept: isImageDragAccept } = useDropzone({
    onDrop: onOtherDrop,
    accept: IMAGE_ACCEPT,
    multiple: true,
  });

  const removeOtherImage = useCallback((index) => {
    setOtherImages((prev) => {
      const file = prev[index];
      if (file?.id) {
        setDeleteImagesId((prevIds) => [...prevIds, file.id]);
      }
      if (file?.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const maxVisible = isReel ? 4 : 7;
  const extraCount = OtherImages.length > maxVisible ? OtherImages.length - (maxVisible - 1) : 0;
  const visibleImages = OtherImages.slice(0, extraCount > 0 ? maxVisible : OtherImages.length);

  const imageCards = useMemo(
    () =>
      visibleImages.map((file, index) => (
        <ImageCard
          key={`${file?.file?.name}-${file?.file?.size}-${index}`}
          file={file}
          index={index}
          onRemove={removeOtherImage}
          extraCount={index === maxVisible - 1 ? extraCount : 0}
          onOpenModal={() => setGalleryModalOpen(true)}
        />
      )),
    [visibleImages, removeOtherImage, extraCount, maxVisible]
  );

  const isAtLimit = OtherImages.length >= maxGalleryImages;

  const imageGridClass = cn(
    "grid gap-3",
    isReel
      ? "grid-cols-2 md:grid-cols-2 xl:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7"
  );

  const imageDropzone = (
    <div
      {...getRootImageProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-2 flex flex-col items-center justify-center min-h-43.75 transition-colors",
        isAtLimit ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/60"
      )}
    >
      <input {...getInputImageProps()} disabled={isAtLimit} />
      <DropZoneContent isDragAccept={isImageDragAccept} />
    </div>
  );

  // Synthetic videoData shape for displaying an existing server-side reel
  const existingReelAsVideoData = existingReel
    ? { thumbnail: existingReel.thumbnail, file: { name: t("videoAd") }, duration: null }
    : null;

  const videoSection = (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-sm">{t("videoAd")}</p>

      <div
        {...getRootVideoProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-2 flex flex-col items-center justify-center min-h-43.75 transition-colors",
          videoLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/60"
        )}
      >
        <input {...getInputVideoProps()} />
        {videoLoading ? (
          <span className="text-muted-foreground text-sm">{t("loading")}</span>
        ) : (
          <DropZoneContent isDragAccept={isVideoDragAccept} />
        )}
      </div>

      {videoData ? (
        <VideoPreviewCard
          videoData={videoData}
          onEdit={() => setEditVideoModalOpen(true)}
        />
      ) : existingReelAsVideoData ? (
        <VideoPreviewCard videoData={existingReelAsVideoData} />
      ) : null}

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{t("maxVideoSize")} {reelMaxSize} MB</span>
        <span>{t("recommendedVideoRatio")}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      {isReel ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {videoSection}
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-sm">{t("adImages")}</p>
            {imageDropzone}
            <div className={imageGridClass}>{imageCards}</div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-sm">{t("adImages")}</p>
          {imageDropzone}
          <div className={imageGridClass}>{imageCards}</div>
        </div>
      )}

      <AdVideoSection
        defaultDetails={defaultDetails}
        setTranslations={setTranslations}
        defaultLangId={defaultLangId}
        isEdit
      />

      <div className="flex justify-end gap-3">
        <button
          className="bg-black text-white px-4 py-2 rounded-md text-xl font-light"
          onClick={handleGoBack}
        >
          {t("back")}
        </button>
        <button
          className="bg-primary text-white px-4 py-2 rounded-md text-xl font-light"
          onClick={handleImageSubmit}
        >
          {t("next")}
        </button>
      </div>

      <ImageGalleryModal
        open={galleryModalOpen}
        onClose={setGalleryModalOpen}
        otherImages={OtherImages}
        onRemove={removeOtherImage}
        onAccepted={onImagesAccepted}
        maxFiles={maxGalleryImages}
      />

      {videoData && (
        <EditVideoModal
          open={editVideoModalOpen}
          onClose={() => setEditVideoModalOpen(false)}
          videoData={videoData}
          onSave={handleVideoSave}
          trimVideo={trimVideo}
        />
      )}
    </div>
  );
};

export default EditImageUpload;
