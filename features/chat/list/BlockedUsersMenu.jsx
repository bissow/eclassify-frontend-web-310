import { useTranslation } from "@/lang/useTranslation";
import { ProhibitIcon } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getBlockedUsers } from "@/lib/api";
import { useState } from "react";
import { BlockedUserSkeleton } from "@/features/chat/ChatSkeletons";
import useChatBlockUser from "@/features/chat/hooks/useChatBlockUser";
import { useSelector } from "react-redux";
import { getIsRtl } from "@/store/slices/languageSlice";
import UserAvatar from "@/components/common/UserAvatar";

const BlockedUsersMenu = () => {
  const { t } = useTranslation();
  const [blockedUsersList, setBlockedUsersList] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unblockingId, setUnblockingId] = useState("");
  const isRTL = useSelector(getIsRtl);

  const fetchBlockedUsers = async () => {
    setLoading(true);
    try {
      const response = await getBlockedUsers.blockedUsers();
      const { data } = response;
      setBlockedUsersList(data?.data);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchBlockedUsers();
    }
  };

  const toggleBlock = useChatBlockUser();

  // Unblocks from outside any one conversation, so no chat id is passed and
  // every row involving this user is updated.
  const handleUnblock = async (userId, e) => {
    e.stopPropagation();
    setUnblockingId(userId);
    const ok = await toggleBlock(userId, false);
    if (ok) {
      setBlockedUsersList((prevList) => prevList.filter((user) => user.id !== userId));
    }
    setUnblockingId("");
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-hidden">
          <ProhibitIcon size={22} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-72">
        <DropdownMenuLabel>{t("blockedUsers")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <BlockedUserSkeleton count={2} />
          ) : blockedUsersList && blockedUsersList.length > 0 ? (
            <DropdownMenuGroup>
              {blockedUsersList.map((user) => (
                <DropdownMenuItem
                  key={user.id}
                  className="flex items-center justify-between p-2"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-gray-200 relative">
                      <UserAvatar
                        src={user?.profile}
                        initial={user?.initial}
                        avatarColor={user?.avatar_color}
                        alt={user.name}
                        size={40}
                      />
                    </div>
                    <span className="truncate">{user.name}</span>
                  </div>
                  <button
                    onClick={(e) => handleUnblock(user?.id, e)}
                    disabled={unblockingId === user?.id}
                    className={`px-3 py-1 text-sm ${unblockingId === user?.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary hover:bg-primary/80"
                      } text-white rounded-md shrink-0 ml-2`}
                  >
                    {t("unblock")}
                  </button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              {t("noBlockedUsers")}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default BlockedUsersMenu;
