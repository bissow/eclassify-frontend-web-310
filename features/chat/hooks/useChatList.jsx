import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { chatListApi } from "@/lib/api";
import {
  startChatListLoad,
  finishChatListLoad,
  failChatListLoad,
  setSelectedChat,
} from "@/store/slices/chatSlice";
import { setUnreadChatCount } from "@/store/slices/authSlice";

// Loads a page of the sidebar chat list into the store.
// `itemId` narrows a seller's list to one ad; the buyer's list has no ad scope.
const useChatList = ({ isSelling, itemId }) => {
  const dispatch = useDispatch();

  return async (page = 1, search = "") => {
    dispatch(startChatListLoad(page));
    try {
      const res = await chatListApi.chatList({
        type: isSelling ? "seller" : "buyer",
        ...(itemId && { item_id: itemId }),
        page,
        search,
      });
      const d = res?.data?.data ?? {};
      dispatch(
        finishChatListLoad({
          page,
          rows: d.data ?? [],
          total: d.total,
          currentPage: d.current_page,
          lastPage: d.last_page,
        })
      );
      dispatch(
        setUnreadChatCount({ isSelling, count: Number(res?.data?.total_unread_chat_count) || 0 })
      );
    } catch (err) {
      console.error(err);
      dispatch(failChatListLoad());
    }
  };
};

export default useChatList;

// Keeps the open conversation in sync with `chatid` in the URL.
// The row normally comes from the sidebar list, but a chat opened from page 2+
// is missing after a reload — the list restarts at page one — so it is fetched
// on its own by id. One lookup per chat id; a row that later arrives through
// paging takes over without another request.
// Subscribing to the row rather than the whole list keeps the caller out of
// every paging update — rows keep their identity when a page is appended, so
// this only fires when that one conversation actually changes.
export const useResolveSelectedChat = ({ isSelling, chatId }) => {
  const dispatch = useDispatch();
  const row = useSelector((state) =>
    state.Chat.List.list.find((chat) => chat.id === chatId)
  );
  const requestedRef = useRef(null);

  // Drop the previous chat's details right away so nothing reads them under the new chatId.
  useEffect(() => {
    dispatch(setSelectedChat(null));
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    if (row) {
      dispatch(setSelectedChat(row));
      return;
    }
    if (requestedRef.current === chatId) return;
    requestedRef.current = chatId;
    chatListApi
      .chatList({ type: isSelling ? "seller" : "buyer", item_offer_id: chatId })
      .then((res) => {
        const fetched = res?.data?.data?.data?.[0];
        // Ignore a response the user has already navigated away from.
        if (fetched && requestedRef.current === chatId) {
          dispatch(setSelectedChat(fetched));
        }
      })
      .catch((err) => console.error(err));
  }, [chatId, row, isSelling]);
};
