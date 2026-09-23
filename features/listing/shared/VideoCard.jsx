import { useTranslation } from "@/lang/useTranslation";
import { formatDuration } from "@/features/listing/lib/video";
import CustomImage from "@/components/common/CustomImage";
import { PlayCircleIcon } from "@phosphor-icons/react";

const VideoPreviewCard = ({ videoData, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
  <div className="flex items-center gap-3 border rounded-lg p-2">
    <div className="relative w-9 aspect-9/16 shrink-0 rounded-md overflow-hidden bg-black">
      <CustomImage
        src={videoData.thumbnail}
        alt={videoData.file.name}
        width={36}
        height={64}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <PlayCircleIcon size={22} weight="fill" />
      </div>
    </div>

    <div className="flex-1 min-w-0">
      <p className="font-medium truncate" title={videoData.file.name}>{videoData.file.name}</p>
      {videoData.duration != null && (
        <p className="text-sm text-muted-foreground">
          {formatDuration(
            videoData.trimStart != null && videoData.trimEnd != null
              ? videoData.trimEnd - videoData.trimStart
              : videoData.duration
          )}
        </p>
      )}
    </div>

    <div className="flex gap-2 shrink-0">
      {onEdit && (
        <button
          className="bg-primary text-white text-sm px-3 py-1.5 rounded-md"
          onClick={onEdit}
        >
          {t("edit")}
        </button>
      )}
      {onDelete && (
        <button
          className="bg-destructive text-white text-sm px-3 py-1.5 rounded-md"
          onClick={onDelete}
        >
          {t("delete")}
        </button>
      )}
    </div>
  </div>
  );
};

export default VideoPreviewCard;
