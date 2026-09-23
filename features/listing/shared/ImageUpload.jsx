import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useTranslation } from "@/lang/useTranslation";
import CustomImage from "@/components/common/CustomImage";
import { Badge } from "@/components/ui/badge";
import { memo, useCallback, useMemo, useState } from "react";
import { PlayCircleIcon, UploadSimpleIcon, XIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import { getMaxGalleryImages, getReelMaxSize } from "@/store/slices/settingSlice";
import { useSearchParams } from "next/navigation";
import ImageGalleryModal from "@/features/listing/shared/ImageGalleryModal";
import ImageEditorModal from "@/features/listing/shared/ImageEditorModal";
import useFileDropzone from "@/features/listing/hooks/useFileDropzone";
import { IMAGE_ACCEPT, MAX_VIDEO_DIMENSION, VIDEO_ACCEPT } from "@/lib/constants";
import { getVideoDimensions, processVideo } from "@/features/listing/lib/video";
import VideoPreviewCard from "@/features/listing/shared/VideoCard";
import EditVideoModal from "@/features/listing/shared/EditVideoModal";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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

const ImageCard = memo(({ fileObj, index, onRemove, onEdit, extraCount, onOpenModal }) => {
  const { t } = useTranslation();
  return (
  <div className="relative rounded-2xl overflow-hidden aspect-square w-full group">
    <CustomImage
      width={145}
      height={145}
      className="object-cover w-full h-full"
      src={fileObj.preview}
      alt={fileObj.file.name}
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
      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
        {onEdit && (
          <button
            type="button"
            className="bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-full p-1.5 shadow transition-all hover:scale-105 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(index);
            }}
            title={t("editImage") || "Edit Image"}
          >
            <PencilSimpleIcon size={16} />
          </button>
        )}
        <button
          type="button"
          className="bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-destructive rounded-full p-1.5 shadow transition-all hover:scale-105 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          title={t("delete") || "Delete"}
        >
          <XIcon size={16} />
        </button>
      </div>
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

const VIDEO_LINK_TYPES = ["youtube_link", "vimeo_link", "other_link"];
const VIDEO_LINK_PLACEHOLDER_KEY = {
  youtube_link: "enterYoutubeUrl",
  vimeo_link: "enterVimeoUrl",
  other_link: "enterUrl",
};

export const AdVideoSection = ({ defaultDetails, setTranslations, defaultLangId, isEdit = false }) => {
  const { t } = useTranslation();
  const videoType = defaultDetails?.video_type ?? "file";
  const videoLink = defaultDetails?.video_link ?? "";
  const isLinkType = VIDEO_LINK_TYPES.includes(videoType);
  const itemVideo = defaultDetails?.product_video ?? null;
  const existingUrl = defaultDetails?.existing_product_video_url ?? null;

  const setField = (field, value) =>
    setTranslations((prev) => ({ ...prev, [defaultLangId]: { ...prev[defaultLangId], [field]: value } }));

  // Remembers each link type's last typed value in translations state (survives step navigation, session only).
  const handleVideoTypeChange = (val) => {
    setTranslations((prev) => {
      const current = prev[defaultLangId] || {};
      const currentType = current.video_type ?? "file";
      const currentLink = current.video_link ?? "";
      const prevMap = current.video_links_by_type ?? {};
      const updatedMap = VIDEO_LINK_TYPES.includes(currentType)
        ? { ...prevMap, [currentType]: currentLink }
        : prevMap;
      const nextLink = VIDEO_LINK_TYPES.includes(val) ? updatedMap[val] ?? "" : "";
      return {
        ...prev,
        [defaultLangId]: { ...current, video_type: val, video_link: nextLink, video_links_by_type: updatedMap },
      };
    });
  };

  const handleLinkChange = (value) => setField("video_link", value);

  const itemVideoUrl = useMemo(() => (itemVideo ? URL.createObjectURL(itemVideo) : null), [itemVideo]);

  const replaceItemVideo = (file) => {
    if (itemVideoUrl) URL.revokeObjectURL(itemVideoUrl);
    setField("product_video", file);
  };

  const preview = itemVideo
    ? { src: itemVideoUrl, label: itemVideo.name, onDelete: () => replaceItemVideo(null) }
    : existingUrl
    ? { src: existingUrl, label: t("productVideo"), subtitle: t("uploadedVideo"), onDelete: () => setField("existing_product_video_url", null) }
    : null;

  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    accept: VIDEO_ACCEPT,
    multiple: false,
    onDrop: async ([file]) => {
      if (!file) return;
      const { width, height } = await getVideoDimensions(file);
      if (width > MAX_VIDEO_DIMENSION || height > MAX_VIDEO_DIMENSION) {
        toast.error(t("videoExceedsMaxDimension"));
        return;
      }
      replaceItemVideo(file);
    },
    onDropRejected: () => toast.error(t("onlyMp4VideoSupported")),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="px-4 p-2 bg-muted rounded-md flex items-center justify-between gap-3">
        <p className="font-semibold text-sm">{t("productVideo")}</p>
        <Select value={videoType} onValueChange={handleVideoTypeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="file">{t("custom")}</SelectItem>
              <SelectItem value="youtube_link">{t("youtubeLink")}</SelectItem>
              <SelectItem value="vimeo_link">{t("vimeoLink")}</SelectItem>
              <SelectItem value="other_link">{t("otherLink")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {isLinkType ? (
        <Input type="url" placeholder={t(VIDEO_LINK_PLACEHOLDER_KEY[videoType])} value={videoLink} onChange={(e) => handleLinkChange(e.target.value)} />
      ) : isEdit ? (
        <>
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-2 flex flex-col items-center justify-center min-h-43.75 transition-colors cursor-pointer hover:border-primary/60"
          >
            <input {...getInputProps()} />
            <DropZoneContent isDragAccept={isDragAccept} />
          </div>
          {preview && (
            <div className="flex items-center gap-3 border rounded-lg p-3">
              <div className="relative h-16 w-24 rounded overflow-hidden shrink-0">
                <video src={preview.src} className="h-full w-full object-cover" muted preload="metadata" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <PlayCircleIcon size={28} className="text-white" weight="fill" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{preview.label}</p>
                {preview.subtitle && <p className="text-xs text-muted-foreground">{preview.subtitle}</p>}
              </div>
              <button type="button" className="bg-destructive text-white text-sm px-3 py-1.5 rounded-md shrink-0" onClick={preview.onDelete}>
                {t("delete")}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-lg p-2 flex flex-col items-center justify-center min-h-43.75 transition-colors cursor-pointer hover:border-primary/60"
          >
            <input {...getInputProps()} />
            <DropZoneContent isDragAccept={isDragAccept} />
          </div>
          {preview && (
            <div className="flex items-center gap-3 border rounded-lg p-3">
              <div className="relative h-16 w-24 rounded overflow-hidden shrink-0">
                <video src={preview.src} className="h-full w-full object-cover" muted preload="metadata" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <PlayCircleIcon size={28} className="text-white" weight="fill" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{preview.label}</p>
                {preview.subtitle && <p className="text-xs text-muted-foreground">{preview.subtitle}</p>}
              </div>
              <button type="button" className="bg-destructive text-white text-sm px-3 py-1.5 rounded-md shrink-0" onClick={preview.onDelete}>
                {t("delete")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const ImageUpload = ({ otherImages, setOtherImages, videoData, setVideoData, onNext, handleGoBack, defaultDetails, setTranslations, defaultLangId, trimVideo }) => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const isVideo = searchParams.get("type") === "video";
  const maxGalleryImages = useSelector(getMaxGalleryImages);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [editVideoModalOpen, setEditVideoModalOpen] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleSaveEditedImage = useCallback((newFile, newPreviewUrl) => {
    if (editingIndex === null) return;
    setOtherImages((prev) => {
      const updated = [...prev];
      if (updated[editingIndex]) {
        URL.revokeObjectURL(updated[editingIndex].preview);
        updated[editingIndex] = {
          file: newFile,
          preview: newPreviewUrl,
        };
      }
      return updated;
    });
    setEditingIndex(null);
  }, [editingIndex, setOtherImages]);

  const handleVideoSave = useCallback(({ thumbnail, thumbnailTime, trimStart, trimEnd, trimmedFile }) => {
    setVideoData((prev) => prev ? { ...prev, thumbnail, thumbnailTime, trimStart, trimEnd, trimmedFile } : prev);
  }, [setVideoData]);

  const reelMaxSize = useSelector(getReelMaxSize)

  const onImagesAccepted = useCallback((files) => {
    setOtherImages((prev) => [
      ...prev,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  }, []);

  const removeImage = useCallback((index) => {
    setOtherImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const {
    getRootProps: getRootImageProps,
    getInputProps: getInputImageProps,
    isDragAccept: isImageDragAccept,
    isAtLimit,
  } = useFileDropzone({
    accept: IMAGE_ACCEPT,
    maxFiles: maxGalleryImages,
    currentCount: otherImages.length,
    onAccepted: onImagesAccepted,
  });

  const revokeVideoBlobs = useCallback((data) => {
    if (!data) return;
    URL.revokeObjectURL(data.url);
    URL.revokeObjectURL(data.thumbnail);
    data.frames.forEach(URL.revokeObjectURL);
  }, []);

  const deleteVideo = useCallback(() => {
    revokeVideoBlobs(videoData);
    setVideoData(null);
  }, [videoData, revokeVideoBlobs]);

  const onVideoDrop = useCallback(async ([file]) => {
    if (!file) return;
    if (reelMaxSize && file.size / (1024 * 1024) > reelMaxSize) {
      toast.error(`${t("videoExceedsMaxSize")} ${reelMaxSize} MB`);
    }
    setVideoLoading(true);
    try {
      const result = await processVideo(file, 6, t);
      if (!result) return;
      const { duration: rawDuration, firstFrame, frames } = result;
      const duration = Math.round(rawDuration * 10) / 10;
      setVideoData((prev) => {
        revokeVideoBlobs(prev);
        return {
          file,
          url: URL.createObjectURL(file),
          duration,
          thumbnail: firstFrame,
          frames,
        };
      });
    } finally {
      setVideoLoading(false);
    }
  }, [revokeVideoBlobs, reelMaxSize]);

  const {
    getRootProps: getRootVideoProps,
    getInputProps: getInputVideoProps,
    isDragAccept: isVideoDragAccept,
  } = useDropzone({
    accept: VIDEO_ACCEPT,
    multiple: false,
    onDrop: onVideoDrop,
    onDropRejected: () => toast.error(t("onlyMp4VideoSupported")),
  });

  const maxVisible = isVideo ? 4 : 7;
  const extraCount =
    otherImages.length > maxVisible ? otherImages.length - (maxVisible - 1) : 0;
  const visibleImages = otherImages.slice(
    0,
    extraCount > 0 ? maxVisible : otherImages.length
  );

  const imageCards = useMemo(
    () =>
      visibleImages.map((fileObj, index) => (
        <ImageCard
          key={`${fileObj.file.name}-${fileObj.file.size}-${index}`}
          fileObj={fileObj}
          index={index}
          onRemove={removeImage}
          onEdit={setEditingIndex}
          extraCount={index === maxVisible - 1 ? extraCount : 0}
          onOpenModal={() => setGalleryModalOpen(true)}
        />
      )),
    [visibleImages, removeImage, extraCount, maxVisible, setEditingIndex]
  );

  const imageGridClass = cn(
    "gap-3",
    isVideo
      ? "grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4"
      : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7"
  );

  const imageDropzone = (
    <div
      {...getRootImageProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-2 flex flex-col items-center justify-center min-h-43.75 transition-colors",
        isAtLimit ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/60"
      )}
    >
      <input {...getInputImageProps()} />
      <DropZoneContent isDragAccept={isImageDragAccept} />
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      {isVideo ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-sm">{t("videoAd")}</p>
            <div
              {...(!videoLoading ? getRootVideoProps() : {})}
              className={cn(
                "flex-1 border-2 border-dashed rounded-lg p-2 flex flex-col items-center justify-center min-h-43.75 transition-colors",
                videoLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/60"
              )}
            >
              {!videoLoading && <input {...getInputVideoProps()} />}
              {videoLoading ? (
                <span className="text-muted-foreground text-sm">{t("loading")}</span>
              ) : (
                <DropZoneContent isDragAccept={isVideoDragAccept} />
              )}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("maxVideoSize")} {reelMaxSize} MB</span>
              <span>{t("recommendedVideoRatio")}</span>
            </div>
            {videoData && (
              <VideoPreviewCard
                videoData={videoData}
                onEdit={() => setEditVideoModalOpen(true)}
                onDelete={deleteVideo}
              />
            )}
          </div>

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
          onClick={onNext}
        >
          {t("next")}
        </button>
      </div>

      <ImageGalleryModal
        open={galleryModalOpen}
        onClose={setGalleryModalOpen}
        otherImages={otherImages}
        onRemove={removeImage}
        onEdit={(index) => {
          setGalleryModalOpen(false);
          setEditingIndex(index);
        }}
        onAccepted={onImagesAccepted}
        maxFiles={maxGalleryImages}
      />

      {editingIndex !== null && otherImages[editingIndex] && (
        <ImageEditorModal
          open={editingIndex !== null}
          onClose={() => setEditingIndex(null)}
          fileObj={otherImages[editingIndex]}
          onSave={handleSaveEditedImage}
        />
      )}

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

export default ImageUpload;
