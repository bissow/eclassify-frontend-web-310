import { useTranslation } from "@/lang/useTranslation";
import NoConversationIllustration from "@/features/chat/conversation/NoConversationIllustration";

const NoChatFound = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 text-center items-center justify-center">
      <NoConversationIllustration width={296} height={237} />
      <h5 className="text-primary text-2xl font-medium">{t("noConversationSelectedYet")}</h5>
      <p className="text-muted-foreground max-w-80">{t("pickAConversation")}</p>
    </div>
  );
};

export default NoChatFound;
