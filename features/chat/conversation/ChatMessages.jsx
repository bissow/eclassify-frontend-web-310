import { userSignUpData } from "@/store/slices/authSlice";
import { useTranslation } from "@/lang/useTranslation";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { ChatMessagesSkeleton } from "@/features/chat/ChatSkeletons";
import { CaretUpIcon, CircleNotchIcon } from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import ChatMessage from "@/features/chat/conversation/ChatMessage";
import useChatMessages from "@/features/chat/hooks/useChatMessages";
import useChatTemplateQuestions from "@/features/chat/hooks/useChatTemplateQuestions";
import {
  getMessageSelectMode,
  getSelectedMessageIds,
  getSelectedChat,
} from "@/store/slices/chatSlice";
import { PhotoProvider } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { getIsRtl } from "@/store/slices/languageSlice";
import SendMessage from "./SendMessage";

const ChatMessages = ({ isSelling, chatId }) => {
  const { t } = useTranslation();
  const selectMode = useSelector(getMessageSelectMode);
  const selectedMessages = useSelector(getSelectedMessageIds);
  const isRTL = useSelector(getIsRtl);
  const userId = useSelector(userSignUpData)?.id;
  const selectedChat = useSelector(getSelectedChat);
  const otherPartyName = isSelling ? selectedChat?.buyer?.name : selectedChat?.seller?.name;

  // chat_ad_id is the ad id; fetched here so useChatMessages can gate scroll-to-bottom on it too.
  const itemId = Number(useSearchParams().get("chat_ad_id")) || undefined;
  const { replies: quickReplies, isLoading: isLoadingQuickReplies } =
    useChatTemplateQuestions(itemId);

  const {
    rows,
    isLoading,
    isLoadingPrev,
    hasMore,
    loadPrevious,
    scrollRef,
    handleDelete,
    handleToggleSelect,
    handleStartSelect,
  } = useChatMessages({
    chatId,
    isSelling,
    isLoadingQuickReplies,
    isComposerReady: !!selectedChat,
  });

  return (
    <>
      <PhotoProvider>
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 relative"
        >
          {isLoading ? (
            <ChatMessagesSkeleton />
          ) : (
            <>
              {hasMore && (
                <div className="absolute top-3 left-0 right-0 z-10 flex justify-center pb-2">
                  <button
                    onClick={loadPrevious}
                    disabled={isLoadingPrev}
                    className="text-primary text-sm font-medium px-3 py-1.5 bg-white/90 rounded-full shadow-md hover:bg-white flex items-center gap-1.5"
                  >
                    {isLoadingPrev ? (
                      <>
                        <CircleNotchIcon className="w-3.5 h-3.5 animate-spin" weight="bold" />
                        {t("loading")}
                      </>
                    ) : (
                      <>
                        <CaretUpIcon weight="bold" />
                        {t("loadPreviousMessages")}
                      </>
                    )}
                  </button>
                </div>
              )}

              {rows.map(({ msg, date, time, showDate, showTime }) => (
                <ChatMessage
                  key={msg?.id}
                  msg={msg}
                  isCurrentUser={msg.sender_id === userId}
                  otherPartyName={otherPartyName}
                  date={date}
                  time={time}
                  showDate={showDate}
                  showTime={showTime}
                  selectMode={selectMode}
                  isSelected={selectedMessages.includes(msg.id)}
                  onToggleSelect={handleToggleSelect}
                  onStartSelect={handleStartSelect}
                  onDelete={handleDelete}
                  isRTL={isRTL}
                />
              ))}
            </>
          )}
        </div>
      </PhotoProvider>
      <SendMessage
        key={`send-${chatId}`}
        chatId={chatId}
        quickReplies={quickReplies}
        isLoadingQuickReplies={isLoadingQuickReplies}
      />
    </>
  );
};

export default ChatMessages;
