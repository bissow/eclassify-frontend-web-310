"use client";
import NoData from "@/components/empty-states/NoData";
import { useTranslation } from "@/lang/useTranslation";

// t() is client-only, so the empty state needs its own client boundary to be
// renderable from the server shell.
const SellerNotFound = () => {
  const { t } = useTranslation();
  return <NoData title={t("noSellerFound")} />;
};

export default SellerNotFound;
