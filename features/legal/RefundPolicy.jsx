"use client";
import BreadCrumb from "@/components/common/BreadCrumb";
import parse from "html-react-parser";
import { useTranslation } from "@/lang/useTranslation";

// `content` is fetched server-side in the route (deduped with the layout's
// getSystemSettings call), so the HTML ships with the copy already in it.
const RefundPolicy = ({ content }) => {
  const { t } = useTranslation();
  return (
    <>
      <BreadCrumb items={[{ name: t("refundPolicy") }]} />
      <div className="container">
        <div className="max-w-full prose lg:prose-lg py-7">
          {parse(content || "")}
        </div>
      </div>
    </>
  );
};

export default RefundPolicy;
