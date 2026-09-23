import { useTranslation } from "@/lang/useTranslation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import NoData from "@/components/empty-states/NoData";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import useChatSelectMode from "@/features/chat/hooks/useChatSelectMode";
import useChatList from "@/features/chat/hooks/useChatList";
import ChatListToolbar from "@/features/chat/list/ChatListToolbar";
import ChatListCard from "@/features/chat/list/ChatListCard";
import { ChatListCardSkeleton } from "@/features/chat/ChatSkeletons";
import { getChatList } from "@/store/slices/chatSlice";

// Buying tab: every conversation the user started as a buyer. The first page is
// loaded by Chat.jsx; this component drives search, paging and selection.
const BuyingChatList = () => {
  const { t } = useTranslation();
  const chatId = Number(useSearchParams().get("chatid")) || "";
  const listData = useSelector(getChatList);
  const [search, setSearch] = useState("");

  const fetchList = useChatList({ isSelling: false });

  const {
    selectMode, setSelectMode,
    selectedChats, setSelectedChats,
    isDeleteModalOpen, setIsDeleteModalOpen,
    isDeleting, handleBulkDelete, requestDelete,
  } = useChatSelectMode({ isSelling: false });

  const debouncedFetch = useDebouncedCallback((value) => fetchList(1, value), 800);

  const sentinelRef = useInfiniteScroll(
    () => fetchList(listData.currentPage + 1, search),
    { hasMore: listData.hasMore, isLoading: listData.isLoading }
  );

  return (
    <>
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

      <div className="flex-1 overflow-y-auto flex flex-col">
        {listData.isLoading ? (
          <ChatListCardSkeleton count={8} />
        ) : listData.list.length > 0 ? (
          <>
            {listData.list.map((chat) => (
              <ChatListCard
                key={chat.id}
                chat={chat}
                isSelling={false}
                isActive={chat?.id === chatId}
                chatAdId={chat?.item?.id}
                selectMode={selectMode}
                selectedChats={selectedChats}
                setSelectedChats={setSelectedChats}
                setSelectMode={setSelectMode}
                onRequestDelete={requestDelete}
              />
            ))}
            {listData.hasMore && (
              <div ref={sentinelRef} className="py-2">
                <ChatListCardSkeleton />
              </div>
            )}
          </>
        ) : (
          <NoData title={t("noChatFound")} />
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
    </>
  );
};

export default BuyingChatList;
