import { memo } from "react";
import useFileDropzone from "@/features/listing/hooks/useFileDropzone";
import { IMAGE_ACCEPT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lang/useTranslation";
import CustomImage from "@/components/common/CustomImage";
import { Badge } from "@/components/ui/badge";
import { UploadSimpleIcon, XIcon } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ModalImageCard = memo(({ fileObj, index, onRemove }) => {
  const { t } = useTranslation();
  return (
  <div className="relative rounded-2xl overflow-hidden aspect-square w-full">
    <CustomImage
      width={145}
      height={145}
      className="object-cover w-full h-full"
      src={fileObj.preview}
      alt={fileObj.file.name}
    />
    <button
      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
      onClick={() => onRemove(index)}
    >
      <XIcon size={18} color="black" />
    </button>
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
