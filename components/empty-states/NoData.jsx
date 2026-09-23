'use client'
import NoDataIllustration from "@/components/empty-states/NoDataIllustration";
import { useTranslation } from "@/lang/useTranslation";

const NoData = ({ title }) => {
  const { t } = useTranslation();
  return (
    <div className="text-center flex flex-col items-center justify-center gap-2 h-[50vh]">
      <div>
        <NoDataIllustration width={200} height={200} />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-medium text-primary">
          {title}
        </h3>
        <p>{t("sorryTryAnotherWay")}</p>
      </div>
    </div>
  );
};

export default NoData;
