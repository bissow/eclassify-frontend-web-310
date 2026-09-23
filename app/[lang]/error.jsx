"use client"; // Error components must be Client Components
import { useEffect } from "react";
import SomethingWentWrongIllustration from "@/components/empty-states/SomethingWentWrongIllustration";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@/hooks/useNavigate";
import { useTranslation } from "@/lang/useTranslation";

export default function Error({ error }) {
  const { t } = useTranslation();
  const { navigate } = useNavigate();
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
  const navigateHome = () => {
    navigate("/");
  };
  return (
    <div className="flex flex-col gap-4 items-center justify-center h-screen">
      <SomethingWentWrongIllustration width={200} height={200} />
      <h3 className="text-2xl font-semibold text-primary text-center">
        {t("somthingWentWrong")}
      </h3>
      <div className="flex flex-col gap-2">
        <span>{t("tryLater")}</span>
        <Button variant="outline" onClick={navigateHome}>
          {t("home")}
        </Button>
      </div>
    </div>
  );
}
