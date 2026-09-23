"use client";
import { useTranslation } from "@/lang/useTranslation";
import SomethingWentWrongIllustration from "@/components/empty-states/SomethingWentWrongIllustration";

export default function MaintenanceScreen() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-2">
      <SomethingWentWrongIllustration height={255} width={255} />
      <p className="text-center max-w-[40%]">{t("underMaintenance")}</p>
    </div>
  );
}
