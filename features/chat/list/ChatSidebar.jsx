import { useTranslation } from "@/lang/useTranslation";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import BlockedUsersMenu from "@/features/chat/list/BlockedUsersMenu";
import ChatTabs from "@/features/chat/list/ChatTabs";
import AdList from "@/features/chat/list/AdList";
import BuyingChatList from "@/features/chat/list/BuyingChatList";
import { getUnreadChatCounts } from "@/store/slices/authSlice";

// Shell for the selling/buying tabs. Each tab's list owns its own state, so
// switching tabs unmounts one and mounts the other with a clean search box.
const ChatSidebar = () => {
  const { t } = useTranslation();
  const activeTab = useSearchParams().get("activeTab") || "selling";
  const counts = useSelector(getUnreadChatCounts);

  return (
    <div className="h-[75vh] max-h-200 lg:h-full flex flex-col">
      <div className="hidden xl:flex p-4 items-center gap-1 justify-between border-b">
        <h4 className="font-medium text-xl">{t("chat")}</h4>
        <BlockedUsersMenu />
      </div>

      <ChatTabs activeTab={activeTab} counts={counts} />

      {activeTab === "selling" ? <AdList /> : <BuyingChatList />}
    </div>
  );
};

export default ChatSidebar;
