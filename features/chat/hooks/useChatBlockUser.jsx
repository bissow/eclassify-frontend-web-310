import { useDispatch } from "react-redux";
import { blockUserApi, unBlockUserApi } from "@/lib/api";
import { setUserBlocked } from "@/store/slices/chatSlice";
import { toast } from "sonner";

// Blocks/unblocks a user, then flips the flag on every affected list row and on
// the open conversation. Pass `chatId` when the action targets one known
// conversation; omit it to target the user across all of them.
const useChatBlockUser = () => {
  const dispatch = useDispatch();

  return async (userId, blocked, chatId) => {
    try {
      const api = blocked ? blockUserApi.blockUser : unBlockUserApi.unBlockUser;
      const response = await api({ blocked_user_id: userId });

      if (response?.data?.error !== false) {
        toast.error(response?.data?.message);
        return false;
      }

      dispatch(setUserBlocked({ userId, chatId, blocked }));
      toast.success(response?.data?.message);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };
};

export default useChatBlockUser;
