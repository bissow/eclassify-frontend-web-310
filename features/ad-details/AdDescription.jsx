import { useState } from "react";
import parse from "html-react-parser";
import { useTranslation } from "@/lang/useTranslation";
const AdDescription = ({ productDetails }) => {
  const { t } = useTranslation();
  const [showFullDescription, setShowFullDescription] = useState(false);

  const translation = productDetails?.translated_item;

  const fullDescription =
    translation?.description?.replace(/\n/g, "<br />");

  const plainText = fullDescription?.replace(/<[^>]*>/g, "") || "";
  const isOverflowing = plainText.length > 300;

  return (
    <div className="flex flex-col gap-4">
      <span className="text-2xl font-medium">{t("description")}</span>
      <div className="relative">
        <div
          className={`${isOverflowing && !showFullDescription ? "max-h-36" : "max-h-full"
            } max-w-full prose lg:prose-lg overflow-hidden`}
        >
          {parse(fullDescription || "")}
        </div>
        {/* Gradient fade overlay — visible only when collapsed and content overflows */}
        {isOverflowing && !showFullDescription && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>
      {isOverflowing && (
        <div className="flex justify-center items-center">
          <button
            onClick={() => setShowFullDescription((prev) => !prev)}
            className="text-primary font-bold text-base"
          >
            {showFullDescription ? t("seeLess") : t("seeMore")}
          </button>
        </div>
      )
      }
    </div >
  );
};

export default AdDescription;
