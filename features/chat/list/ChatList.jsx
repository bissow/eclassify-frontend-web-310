import { useTranslation } from "@/lang/useTranslation";
import ChatListCard from "@/features/chat/list/ChatListCard";
import { ChatListCardSkeleton, ChatListHeaderSkeleton } from "@/features/chat/ChatSkeletons";
import NoChatListFound from "@/features/chat/list/NoChatListFound";
import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import CustomImage from "@/components/common/CustomImage";
import { useNavigate } from "@/hooks/useNavigate";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { useDebouncedCallback } from "use-debounce";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import useChatSelectMode from "@/features/chat/hooks/useChatSelectMode";
import useChatList from "@/features/chat/hooks/useChatList";
import ChatListToolbar from "@/features/chat/list/ChatListToolbar";
import { getChatList, setSelectedChat } from "@/store/slices/chatSlice";
import { ArrowLeftIcon } from "@phosphor-icons/react";


// Selling tab, one ad picked: every buyer conversation on that ad. The first
// page is loaded by Chat.jsx; this component drives search, paging and selection.
const ChatList = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const chatAdId = Number(searchParams.get("chat_ad_id")) || "";
  const chatId = Number(searchParams.get("chatid")) || "";
  const { navigate } = useNavigate();
  const dispatch = useDispatch();
  const chatListData = useSelector(getChatList);

  const [search, setSearch] = useState("");

  const fetchChatList = useChatList({ isSelling: true, itemId: chatAdId });

  const {
    selectMode, setSelectMode,
    selectedChats, setSelectedChats,
    isDeleteModalOpen, setIsDeleteModalOpen,
    isDeleting, handleBulkDelete, requestDelete,
  } = useChatSelectMode({ isSelling: true });

  const debouncedFetch = useDebouncedCallback((value) => {
    fetchChatList(1, value);
  }, 800);

  // Every chat in a selling list belongs to the same ad, so the ad shown in the
  // header is derived from the first row rather than stored separately. Cached
  // in a ref so a search that returns zero rows doesn't blank the header —
  // ChatList remounts (key={chatAdId} in Chat.jsx) when the ad itself changes.
  const adDetailRef = useRef(null);
  if (chatListData.list[0]?.item) adDetailRef.current = chatListData.list[0].item;
  const adDetail = adDetailRef.current;
  const totalUnreadCount =
    chatListData.list.filter((chat) => (Number(chat?.unread_chat_count) || 0) > 0)
      .length || 0;

  const ref = useInfiniteScroll(
    () => fetchChatList(chatListData.currentPage + 1, search),
    {
      hasMore: chatListData.hasMore,
      isLoading: chatListData.isLoading || chatListData.isLoadMore,
    }
  );


  const handleHeaderBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("chat_ad_id");
    params.delete("chatid");
    params.delete("lang");
    navigate(`/chat?${params.toString()}`, { scroll: false });
    dispatch(setSelectedChat(null));
  };

  return (
    <div className="h-[60vh] max-h-200 flex flex-col lg:h-full">
      <div className="p-4 flex items-center gap-2 border-b">
        {chatListData.isLoading && !adDetail ? (
          <ChatListHeaderSkeleton />
        ) : (
          <>
            <button
              onClick={handleHeaderBack}
              className="shrink-0"
              aria-label="Back"
            >
              <ArrowLeftIcon size={24} className="rtl:rotate-180" weight="bold" />
            </button>

            <div className="flex-1 flex items-center gap-2 min-w-0">
              <CustomImage
                src={adDetail?.image}
                alt={adDetail?.translation?.name}
                width={44}
                height={44}
                className="object-cover aspect-square rounded-md"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate leading-tight" title={adDetail?.translation?.name}>
                  {adDetail?.translation?.name}
                </h4>
                <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span>{chatListData.total} {t("buyer")}</span>
                  <span className="size-1 rounded-full bg-muted-foreground/30" />
                  <span>{totalUnreadCount} {t("unread")}</span>
                </p>
              </div>
            </div>

            <div className="text-primary font-bold whitespace-nowrap">
              {adDetail?.formatted_price || adDetail?.formatted_salary_range}
            </div>
          </>
        )}
      </div>

      <ChatListToolbar
        selectMode={selectMode}
        selectedCount={selectedChats.length}
        onCancelSelect={() => { setSelectMode(false); setSelectedChats([]); }}
        onDeleteClick={() => setIsDeleteModalOpen(true)}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          debouncedFetch(value);
        }}
      />

      <div className="flex-1 overflow-y-auto" id="chatList">
        {chatListData.isLoading ? (
          <ChatListCardSkeleton count={8} />
        ) : chatListData.list.length > 0 ? (
          <>
            {chatListData.list.map((chat, index) => (
              <ChatListCard
                key={chat.id || index}
                chat={chat}
                chatAdId={chatAdId}
                isActive={chat?.id === chatId}
                isSelling
                selectMode={selectMode}
                selectedChats={selectedChats}
                setSelectedChats={setSelectedChats}
                setSelectMode={setSelectMode}
                onRequestDelete={requestDelete}
              />
            ))}
            {chatListData.hasMore && (
              <div ref={ref} className="py-2">
                <ChatListCardSkeleton count={3} />
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-4">
            <NoChatListFound />
          </div>
        )}
      </div>
      <DeleteConfirmDialog
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("deleteChat")}
        description={t("deleteChatDescription")}
        confirmDisabled={isDeleting}
      />
    </div>
  );
};

export default ChatList;
