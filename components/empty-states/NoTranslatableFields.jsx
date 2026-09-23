import NoDataIllustration from "@/components/empty-states/NoDataIllustration";
import { useTranslation } from "@/lang/useTranslation";

const NoTranslatableFields = () => {
  const { t } = useTranslation();
  return (
    <div className="text-center flex flex-col items-center justify-center gap-2 py-10">
      <div>
        <NoDataIllustration width={200} height={200} />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-medium text-primary">
          {t("noTranslatableFields")}
        </h3>
        <p className="text-muted-foreground text-sm">{t("noTranslatableFieldsDesc")}</p>
      </div>
    </div>
  );
};

export default NoTranslatableFields;
