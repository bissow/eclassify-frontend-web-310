import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useTranslation } from "@/lang/useTranslation";

/**
 * Reusable dropzone hook with built-in limit validation and toast errors.
 *
 * @param {object}   accept       - react-dropzone accept config e.g. { "image/jpeg": [".jpg"] }
 * @param {number}   maxFiles     - max total allowed files
 * @param {number}   currentCount - current number of files already added
 * @param {function} onAccepted   - called with File[] that passed validation
 * @param {boolean}  multiple     - allow multiple files (default true)
 *
 * @returns {{ getRootProps, getInputProps, isDragActive, isAtLimit }}
 */
const useFileDropzone = ({
  accept,
  maxFiles,
  currentCount,
  onAccepted,
  multiple = true,
}) => {
  const { t } = useTranslation();
  const isAtLimit = currentCount >= maxFiles;

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const remainingSlots = maxFiles - currentCount;
      if (remainingSlots === 0) {
        toast.error(t("imageLimitExceeded"));
        return;
      }
      if (acceptedFiles.length > remainingSlots) {
        toast.error(
          t("youCanUpload") + " " + remainingSlots + " " + t("moreImages")
        );
        return;
      }
      onAccepted(acceptedFiles);
    },
    [maxFiles, currentCount, onAccepted, t]
  );

  const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
    onDrop: handleDrop,
    accept,
    multiple,
    disabled: isAtLimit,
  });

  return { getRootProps, getInputProps, isDragActive, isDragAccept, isAtLimit };
};

export default useFileDropzone;
