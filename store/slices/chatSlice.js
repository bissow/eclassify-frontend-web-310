import { createSelector, createSlice } from "@reduxjs/toolkit";

// Shared across list rows, header, composer — kept global to avoid prop drilling.

const EMPTY_LIST = {
  list: [],
  total: 0,
  currentPage: 1,
  hasMore: false,
  isLoading: true,
  isLoadMore: false,
};

const initialState = {
  List: EMPTY_LIST,
  SelectedChat: null,
  Messages: [],
  MessageSelectMode: false,
  SelectedMessageIds: [],
};

// Matches by chatId (single conversation) or userId (all conversations with that user).
const isBlockTarget = (row, { chatId, userId }) =>
  !!row && (chatId ? row.id === chatId : row.buyer_id === userId || row.seller_id === userId);

export const chatSlice = createSlice({
  name: "Chat",
  initialState,
  reducers: {
    // ---- list ----
    startChatListLoad: (state, action) => {
      const page = action.payload;
      state.List.isLoading = page === 1;
      state.List.isLoadMore = page > 1;
    },
    finishChatListLoad: (state, action) => {
      const { page, rows, total, currentPage, lastPage } = action.payload;
      state.List.list = page === 1 ? rows : [...state.List.list, ...rows];
      state.List.total = Number(total) || 0;
      state.List.currentPage = Number(currentPage) || page;
      state.List.hasMore = Number(currentPage) < Number(lastPage);
      state.List.isLoading = false;
      state.List.isLoadMore = false;
    },
    failChatListLoad: (state) => {
      state.List.isLoading = false;
      state.List.isLoadMore = false;
    },
    markChatRead: (state, action) => {
      const row = state.List.list.find((chat) => chat.id === action.payload);
      if (row) row.unread_chat_count = 0;
    },
    // Live push for a chat that isn't open: bump unread, refresh preview, move to top.
    receiveChatMessage: (state, action) => {
      const { chatId, message, time } = action.payload;
      const idx = state.List.list.findIndex((chat) => chat.id === chatId);
      if (idx === -1) return;
      const [row] = state.List.list.splice(idx, 1);
      row.unread_chat_count = (Number(row.unread_chat_count) || 0) + 1;
      if (message) row.last_chat_message = message;
      if (time) row.last_message_time = time;
      state.List.list.unshift(row);
    },
    removeChats: (state, action) => {
      const ids = action.payload;
      state.List.list = state.List.list.filter((chat) => !ids.includes(chat.id));
      state.List.total = Math.max(0, state.List.total - ids.length);
    },
    setUserBlocked: (state, action) => {
      const { blocked } = action.payload;
      state.List.list.forEach((row) => {
        if (isBlockTarget(row, action.payload)) row.user_blocked = blocked;
      });
      if (isBlockTarget(state.SelectedChat, action.payload)) {
        state.SelectedChat.user_blocked = blocked;
      }
    },

    // ---- open conversation ----
    setSelectedChat: (state, action) => {
      state.SelectedChat = action.payload;
    },
    patchSelectedChat: (state, action) => {
      if (state.SelectedChat) Object.assign(state.SelectedChat, action.payload);
      // Also patch the list row, or switching chats and back re-hydrates the stale one.
      const row = state.List.list.find((chat) => chat.id === state.SelectedChat?.id);
      if (row) Object.assign(row, action.payload);
    },

    // ---- messages ----
    setMessages: (state, action) => {
      state.Messages = action.payload;
    },
    prependMessages: (state, action) => {
      // Page-offset pagination can re-return an already-loaded message if a
      // new one was sent in between page fetches — drop repeats before merging.
      const existingIds = new Set(state.Messages.map((m) => m.id));
      const newOnes = action.payload.filter((m) => !existingIds.has(m.id));
      state.Messages = [...newOnes, ...state.Messages];
    },
    appendMessage: (state, action) => {
      state.Messages.push(action.payload);
    },
    removeMessages: (state, action) => {
      const ids = action.payload;
      state.Messages = state.Messages.filter((msg) => !ids.includes(msg.id));
    },

    // ---- message selection ----
    setMessageSelectMode: (state, action) => {
      state.MessageSelectMode = action.payload;
      if (!action.payload) state.SelectedMessageIds = [];
    },
    setSelectedMessageIds: (state, action) => {
      state.SelectedMessageIds = action.payload;
    },

    resetChat: () => initialState,
  },
});

export default chatSlice.reducer;
export const {
  startChatListLoad,
  finishChatListLoad,
  failChatListLoad,
  markChatRead,
  receiveChatMessage,
  removeChats,
  setUserBlocked,
  setSelectedChat,
  patchSelectedChat,
  setMessages,
  prependMessages,
  appendMessage,
  removeMessages,
  setMessageSelectMode,
  setSelectedMessageIds,
  resetChat,
} = chatSlice.actions;

export const getChatList = createSelector(
  (state) => state.Chat,
  (Chat) => Chat.List
);

export const getSelectedChat = createSelector(
  (state) => state.Chat,
  (Chat) => Chat.SelectedChat
);

export const getChatMessages = createSelector(
  (state) => state.Chat,
  (Chat) => Chat.Messages
);

export const getMessageSelectMode = createSelector(
  (state) => state.Chat,
  (Chat) => Chat.MessageSelectMode
);

export const getSelectedMessageIds = createSelector(
  (state) => state.Chat,
  (Chat) => Chat.SelectedMessageIds
);

// Who sent the most recent offer message in this chat — null if none yet.
export const getLastOfferSenderId = createSelector(
  (state) => state.Chat.Messages,
  (messages) => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (Number(messages[i]?.is_offer) === 1) return Number(messages[i].sender_id);
    }
    return null;
  }
);
