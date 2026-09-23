"use client";
import NoDataIllustration from "@/components/empty-states/NoDataIllustration";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useTranslation } from "@/lang/useTranslation";

const NotFound = () => {

  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-3">
      <NoDataIllustration width={200} height={200} />
      <h3 className="text-2xl font-semibold text-primary text-center">
        {t("pageNotFound")}
      </h3>
      <Link href="/" className="flex items-center gap-2">
        <ArrowLeftIcon weight="bold" className="rtl:scale-x-[-1]" /> {t("back")}
      </Link>
    </div>
  );
};

export default NotFound;
