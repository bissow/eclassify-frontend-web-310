import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useTranslation } from "@/lang/useTranslation";
import { deleteChatMessagesApi, getMessagesApi } from "@/lib/api";
import { formatChatMessageTime, formatMessageDate } from "@/lib/format";
import { getReduxCurrentLangCode } from "@/store/slices/languageSlice";
import useStickyScroll from "@/features/chat/hooks/useStickyScroll";
import useNewNotification from "@/features/chat/hooks/useNewNotification";
import {
  getChatMessages,
  getSelectedMessageIds,
  setMessages,
  prependMessages,
  appendMessage,
  removeMessages,
  setMessageSelectMode,
  setSelectedMessageIds,
  patchSelectedChat,
} from "@/store/slices/chatSlice";

// True when a notification belongs to the open chat — also used by PushNotificationLayout.
export const isNotificationForOpenChat = (notification, { chatId, isSelling }) =>
  notification?.type === "chat" &&
  Number(notification?.item_offer_id) === Number(chatId) &&
  (notification?.user_type === "Seller" ? !isSelling : isSelling);

// Paging, live push messages, deletion, selection and scroll for the message list.
const useChatMessages = ({ chatId, isSelling, isLoadingQuickReplies, isComposerReady }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const messages = useSelector(getChatMessages);
  const selectedIds = useSelector(getSelectedMessageIds);
  const notification = useNewNotification();
  const langCode = useSelector(getReduxCurrentLangCode);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingPrev, setIsLoadingPrev] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Waits for quick replies + composer too, since both can resize the list.
  const { scrollRef } = useStickyScroll(
    messages.length > 0 && !isLoadingQuickReplies && isComposerReady,
    messages[messages.length - 1]?.id
  );

  // scrollHeight just before a prev-page prepend, for the restore effect below.
  const prevScrollHeightRef = useRef(null);

  const fetchMessages = async (nextPage) => {
    try {
      if (nextPage > 1) {
        setIsLoadingPrev(true);
        prevScrollHeightRef.current = scrollRef.current?.scrollHeight ?? null;
      } else {
        setIsLoading(true);
      }
      const response = await getMessagesApi.chatMessages({
        item_offer_id: chatId,
        page: nextPage,
      });
      if (response?.data?.error === false) {
        const currentPage = Number(response?.data?.data?.current_page);
        const lastPage = Number(response?.data?.data?.last_page);
        // API is newest-first; UI renders oldest-first.
        const pageMessages = [...(response?.data?.data?.data ?? [])].reverse();
        setPage(currentPage);
        setHasMore(currentPage < lastPage);
        dispatch(nextPage > 1 ? prependMessages(pageMessages) : setMessages(pageMessages));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingPrev(false);
      setIsLoading(false);
    }
  };

  // Restores scroll position after a prev-page prepend shifts content down.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || prevScrollHeightRef.current == null) return;
    el.scrollTop += el.scrollHeight - prevScrollHeightRef.current;
    prevScrollHeightRef.current = null;
  }, [messages]);

  // Clears stale messages/selection before a new chat's first page loads.
  useEffect(() => {
    if (chatId) {
      dispatch(setMessages([]));
      dispatch(setMessageSelectMode(false));
      fetchMessages(1);
    }
  }, [chatId]);

  // A push for the open chat is appended straight in — our own sends already arrive via their response.
  useEffect(() => {
    if (isNotificationForOpenChat(notification, { chatId, isSelling })) {
      const isOffer =
        notification?.is_offer === "1" ||
        notification?.message_type_temp === "offer";
      dispatch(appendMessage({
        message_type: notification?.message_type_temp,
        message: notification?.message,
        sender_id: Number(notification?.sender_id),
        created_at: notification?.created_at,
        audio: notification?.audio,
        file: notification?.file,
        id: Number(notification?.id),
        item_offer_id: Number(notification?.item_offer_id),
        updated_at: notification?.updated_at,
        // Offer pushes have no message body — render as the offer event line.
        is_offer: isOffer ? 1 : 0,
        formatted_amount: notification?.item_formatted_amount,
        amount: notification?.amount,
      }));
      // Sync the header's current-offer display too.
      if (isOffer) {
        dispatch(patchSelectedChat({
          amount: notification?.amount,
          formatted_amount: notification?.item_formatted_amount,
        }));
      }
      // Marks it read server-side — a live push never calls this on its own.
      getMessagesApi.chatMessages({ item_offer_id: chatId, page: 1 }).catch(() => {});
    }
  }, [notification]);

  const handleDelete = async (messageId) => {
    try {
      const response = await deleteChatMessagesApi.deleteChatMessages({
        item_offer_id: chatId,
        message_ids: [messageId],
      });
      if (response?.data?.error === false) {
        dispatch(removeMessages([messageId]));
        toast.success(response?.data?.message);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(t("somthingWentWrong"));
    }
  };

  const handleToggleSelect = (messageId) =>
    dispatch(setSelectedMessageIds(
      selectedIds.includes(messageId)
        ? selectedIds.filter((id) => id !== messageId)
        : [...selectedIds, messageId]
    ));

  const handleStartSelect = (messageId) => {
    dispatch(setMessageSelectMode(true));
    dispatch(setSelectedMessageIds([messageId]));
  };

  // One pass: formats date/time and groups consecutive same-sender messages
  // in the same minute so only the group's last message shows a timestamp.
  const rows = useMemo(() => {
    const out = [];
    let prevDate = null;
    for (const msg of messages) {
      const date = formatMessageDate(msg.created_at, t, langCode);
      const time = formatChatMessageTime(msg.created_at, langCode);
      const showDate = date !== prevDate;
      const prev = out[out.length - 1];
      if (prev) {
        prev.showTime =
          showDate ||
          prev.time !== time ||
          Number(prev.msg.sender_id) !== Number(msg.sender_id);
      }
      out.push({ msg, date, time, showDate, showTime: true });
      prevDate = date;
    }
    return out;
  }, [messages, langCode, t]);

  return {
    rows,
    isLoading,
    isLoadingPrev,
    hasMore,
    loadPrevious: () => fetchMessages(page + 1),
    scrollRef,
    handleDelete,
    handleToggleSelect,
    handleStartSelect,
  };
};

export default useChatMessages;
