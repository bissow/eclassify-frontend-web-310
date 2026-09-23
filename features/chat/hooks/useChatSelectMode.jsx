import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteChatApi } from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "@/lang/useTranslation";
import { useSearchParams } from "next/navigation";
import { useNavigate } from "@/hooks/useNavigate";
import { getChatList, removeChats, setSelectedChat } from "@/store/slices/chatSlice";

// Multi-select + delete for the sidebar list. Selection is local (only one list
// is mounted at a time), the rows it deletes are in the store.
const useChatSelectMode = ({ isSelling }) => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const { navigate } = useNavigate();
  const dispatch = useDispatch();
  const { total } = useSelector(getChatList);
  const chatId = Number(searchParams.get("chatid")) || "";

  const [selectMode, setSelectMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await deleteChatApi.deleteChat({ item_offer_id: selectedChats });
      if (response?.data?.error === false) {
        toast.success(response?.data?.message);
        const newTotal = total - selectedChats.length;
        const params = new URLSearchParams(searchParams.toString());
        dispatch(removeChats(selectedChats));

        // Leave the conversation pane if the chat it shows is gone, and leave
        // the ad entirely once its last chat is gone.
        const activeDeleted = chatId && selectedChats.includes(chatId);
        if (activeDeleted || (newTotal === 0 && !chatId)) {
          if (activeDeleted) params.delete("chatid");
          params.delete("lang");
          if (newTotal === 0 && isSelling) params.delete("chat_ad_id");
          dispatch(setSelectedChat(null));
          navigate(`/chat?${params.toString()}`, { scroll: false });
        }
        setSelectMode(false);
        setSelectedChats([]);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(t("somthingWentWrong"));
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Single-row delete from a card's menu. Reuses the list's dialog and its
  // delete/navigate logic instead of each card owning a copy of both.
  const requestDelete = (id) => {
    setSelectedChats([id]);
    setIsDeleteModalOpen(true);
  };

  return {
    selectMode,
    setSelectMode,
    selectedChats,
    setSelectedChats,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleting,
    handleBulkDelete,
    requestDelete,
  };
};

export default useChatSelectMode;
