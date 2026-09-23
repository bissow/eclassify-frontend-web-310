"use client";
import SelectedChatHeader from "@/features/chat/conversation/SelectedChatHeader";
import ChatList from "@/features/chat/list/ChatList";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import NoChatFound from "@/features/chat/conversation/NoChatFound";
import ChatMessages from "@/features/chat/conversation/ChatMessages";
import { useNavigate } from "@/hooks/useNavigate";
import ChatSidebar from "@/features/chat/list/ChatSidebar";
import { cn } from "@/lib/utils";
import useChatList, { useResolveSelectedChat } from "@/features/chat/hooks/useChatList";
import { resetChat } from "@/store/slices/chatSlice";

const Chat = () => {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("activeTab") || "selling";
  const chatAdId = Number(searchParams.get("chat_ad_id")) || "";
  const chatId = Number(searchParams.get("chatid")) || "";
  const isSelling = activeTab === "selling";
  const { navigate } = useNavigate();
  const dispatch = useDispatch();

  // chat_ad_id is just a breadcrumb on the buying tab, so zero it there to avoid refetching on every chat open.
  const listScopeId = isSelling ? chatAdId : "";

  // Loaded here, not in the list components — they remount on layout switches and would refetch each time.
  const fetchChatList = useChatList({ isSelling, itemId: listScopeId });

  useResolveSelectedChat({ isSelling, chatId });

  // Buying lists load per tab; selling lists load once an ad is picked.
  useEffect(() => {
    if (activeTab === "buying" || listScopeId) {
      fetchChatList(1);
    }
  }, [activeTab, listScopeId]);

  useEffect(() => () => { dispatch(resetChat()); }, []);

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeTab === "buying") {
      params.delete("chat_ad_id");
    }
    params.delete("chatid");
    navigate(`/chat?${params.toString()}`, { scroll: false });
  };

  const showChatInterface = (isSelling && chatAdId) || (!isSelling && chatId);

  if (!showChatInterface) {
    return <ChatSidebar />;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12">
      <div
        className={cn(
          "col-span-5 lg:ltr:border-r lg:rtl:border-l",
          chatId ? "hidden xl:block" : "block"
        )}
      >
        {isSelling ? <ChatList key={chatAdId} /> : <ChatSidebar />}
      </div>

      <div
        className={cn(
          "col-span-12 xl:col-span-7",
          chatId ? "block shadow-none" : "hidden xl:block"
        )}
      >
        {chatId ? (
          <div className="h-[80vh] lg:h-200 flex flex-col">
            <SelectedChatHeader
              isSelling={isSelling}
              handleBack={handleBack}
              chatId={chatId}
            />
            <ChatMessages isSelling={isSelling} chatId={chatId} />
          </div>
        ) : (
          <div className="h-[60vh] lg:h-200 flex items-center justify-center">
            <NoChatFound />
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
