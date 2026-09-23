import { memo } from "react";
import useFileDropzone from "@/features/listing/hooks/useFileDropzone";
import { IMAGE_ACCEPT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lang/useTranslation";
import CustomImage from "@/components/common/CustomImage";
import { Badge } from "@/components/ui/badge";
import { UploadSimpleIcon, XIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ModalImageCard = memo(({ fileObj, index, onRemove, onEdit }) => {
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
    <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
      {onEdit && (
        <button
          type="button"
          className="bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-full p-1.5 shadow transition-all hover:scale-105 cursor-pointer"
          onClick={() => onEdit(index)}
          title={t("editImage") || "Edit Image"}
        >
          <PencilSimpleIcon size={16} />
        </button>
      )}
      <button
        type="button"
        className="bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-destructive rounded-full p-1.5 shadow transition-all hover:scale-105 cursor-pointer"
        onClick={() => onRemove(index)}
        title={t("delete") || "Delete"}
      >
        <XIcon size={16} />
      </button>
    </div>
    {index === 0 && (
      <Badge className="absolute bottom-2 left-2 bg-primary text-white">
        {t("cover")}
      </Badge>
    )}
  </div>
  );
});
ModalImageCard.displayName = "ModalImageCard";

const ImageGalleryModal = ({
  open,
  onClose,
  otherImages,
  onRemove,
  onEdit,
  onAccepted,
  maxFiles,
}) => {
  const { t } = useTranslation();
  const { getRootProps, getInputProps, isDragAccept, isAtLimit } = useFileDropzone({
    accept: IMAGE_ACCEPT,
    maxFiles,
    currentCount: otherImages.length,
    onAccepted,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95%] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t("adImages")}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
          {otherImages.map((fileObj, index) => (
            <ModalImageCard
              key={`modal-${fileObj.file.name}-${fileObj.file.size}-${index}`}
              fileObj={fileObj}
              index={index}
              onRemove={onRemove}
              onEdit={onEdit}
            />
          ))}
          <div
            {...(!isAtLimit ? getRootProps() : {})}
            className={cn(
              "aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1 transition-colors p-2",
              isAtLimit
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:border-primary/60"
            )}
          >
            {!isAtLimit && <input {...getInputProps()} />}
            {isDragAccept && !isAtLimit ? (
              <span className="text-primary font-medium text-xs text-center">
                {t("dropFiles")}
              </span>
            ) : (
              <div className="flex flex-col gap-1 items-center text-center">
                <span className="text-xs text-muted-foreground leading-tight">{t("dragFiles")}</span>
                <span className="text-xs text-muted-foreground">{t("or")}</span>
                <div className="flex items-center text-primary gap-1">
                  <UploadSimpleIcon size={20} />
                  <span className="text-xs text-primary font-medium">{t("upload")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageGalleryModal;
