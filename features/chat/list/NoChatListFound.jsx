import { useTranslation } from "@/lang/useTranslation";
import NoDataIllustration from "@/components/empty-states/NoDataIllustration";

const NoChatListFound = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <NoDataIllustration
        width={200}
        height={200}
        className="w-[200px] h-auto aspect-square"
      />
      <h3 className="font-medium text-2xl text-primary text-center">
        {t("noConversationsFound")}
      </h3>
      <span className="text-sm text-center">{t("noChatsAvailable")}</span>
    </div>
  );
};

export default NoChatListFound;
