'use client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "@/lang/useTranslation";
import { CircleNotchIcon, TrashIcon } from "@phosphor-icons/react";

const DeleteConfirmDialog = ({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  cancelText,
  confirmText,
  confirmDisabled = false,
}) => {
  const { t } = useTranslation();
  // Defaults resolved here, not in the param list — parameter scope closes
  // before the body runs, so it can't see the hook's `t`.
  const cancelLabel = cancelText ?? t("cancel");
  const confirmLabel = confirmText ?? t("yesDelete");


  return (
    <AlertDialog open={open}>
      <AlertDialogContent onInteractOutside={(e) => e.preventDefault()}>
        <AlertDialogHeader className="items-center text-center">
          <div className="flex size-22 items-center justify-center rounded-full bg-destructive/10">
            <TrashIcon size={56} className="text-destructive" />
          </div>
          <AlertDialogTitle className='text-based font-medium'>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription asChild={typeof description !== "string"} className='text-center text-balance' >
              {typeof description === "string" ? description : description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="-mx-6 -mb-6 flex-row gap-3 border-t px-6 py-4">
          <AlertDialogCancel onClick={onCancel} className="mt-0 flex-1">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={confirmDisabled}
            onClick={onConfirm}
            className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmDisabled ? <CircleNotchIcon className="size-4 animate-spin" weight="bold" /> : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;
