"use client";
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
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useTranslation } from "@/lang/useTranslation";
import TermsAndPrivacyLinks from "@/features/auth/TermsAndPrivacyLinks";

const GoogleConsentModal = ({
  open,
  checked,
  onCheckedChange,
  loading,
  onCancel,
  onContinue,
  OnHide,
}) => {
  const { t } = useTranslation();
  return (
    <AlertDialog open={open}>
      <AlertDialogContent onInteractOutside={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("termsConditions")}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <TermsAndPrivacyLinks
              OnHide={OnHide}
              consentChecked={checked}
              setConsentChecked={onCheckedChange}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} onClick={onCancel}>
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction disabled={!checked || loading} onClick={onContinue}>
            {loading ? (
              <CircleNotchIcon className="size-4 animate-spin" weight="bold" />
            ) : (
              t("continue")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GoogleConsentModal;
