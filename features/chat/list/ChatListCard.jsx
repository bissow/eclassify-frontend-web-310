import { useTranslation, useLocale } from "@/lang/useTranslation";
import { timeAgo } from "@/lib/format";
import CustomLink from "@/components/common/CustomLink";
import CustomImage from "@/components/common/CustomImage";
import UserAvatar from "@/components/common/UserAvatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useChatBlockUser from "@/features/chat/hooks/useChatBlockUser";
import { useDispatch, useSelector } from "react-redux";
import { getIsRtl } from "@/store/slices/languageSlice";
import { markChatRead } from "@/store/slices/chatSlice";
import { decreaseUnreadChatCount } from "@/store/slices/authSlice";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react";

const ChatListCard = ({
  chat,
  isSelling,
  isActive = false,
  chatAdId,
  selectMode,
  selectedChats,
  setSelectedChats,
  setSelectMode,
  onRequestDelete,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = isSelling ? chat?.buyer : chat?.seller;
  const isUnread = chat?.unread_chat_count > 0;
  const isBlocked = chat?.user_blocked;
  const isSelected = selectedChats?.includes(chat?.id);

  const toggleSelection = () => {
    setSelectedChats((prev) =>
      isSelected ? prev.filter((id) => id !== chat.id) : [...prev, chat.id]
    );
  };

  const handleSelectClick = () => {
    setSelectMode(true);
    setSelectedChats([chat.id]);
  };
  const isRTL = useSelector(getIsRtl);
  const locale = useLocale();

  const getHref = () => {
    return `/chat?activeTab=${isSelling ? "selling" : "buying"
      }&chatid=${chat?.id}&chat_ad_id=${chatAdId}`;
  };
  const toggleBlock = useChatBlockUser();

  const handleToggleBlock = () => toggleBlock(user?.id, !isBlocked, chat.id);


  return (
    <div
      className={cn(
        "relative border-b last:border-b-0 transition-colors group",
        isActive ? "bg-primary text-white" : "hover:bg-muted",
        selectMode && isSelected && (isActive ? "border-l-4 border-white" : "bg-primary/10 border-l-4 border-primary")
      )}
    >
      {/* Clickable Card Area */}
      <CustomLink
        scroll={false}
        href={getHref()}
        data-prevent-progress={selectMode ? "true" : undefined}
        onClick={(e) => {
          if (selectMode) { e.preventDefault(); toggleSelection(); return; }
          dispatch(markChatRead(chat.id));
          if (isUnread) {
            dispatch(decreaseUnreadChatCount({ isSelling, amount: chat.unread_chat_count }));
          }
        }}
        className="block"
      >
        <div className="py-3 px-4 flex items-center gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <CustomImage
              src={isSelling ? user.profile : chat?.item?.image}
              alt={isSelling ? (user?.name || 'user') : (chat?.item?.translation?.name || 'item')}
              width={56}
              height={56}
              className="w-14 aspect-square object-cover rounded-full"
            />
            {!isSelling &&
              <UserAvatar
                src={user.profile}
                initial={user?.initial}
                avatarColor={user?.avatar_color}
                alt={user?.name || 'user'}
                size={24}
                className="w-6 h-6 absolute top-8 -bottom-1.5 ltr:-right-1.5 rtl:-left-1.5"
              />
            }
          </div>

          {/* Content */}
          <div className="flex flex-col gap-2 w-full min-w-0">
            {/* Top Row */}
            <div className="w-full flex gap-1 items-center justify-between min-w-0">
              <h5 className="font-medium truncate" title={isSelling ? user?.name : chat?.item?.translation?.name}>
                {isSelling ? user?.name : chat?.item?.translation?.name}
              </h5>

              <span
                className={cn(
                  "text-xs transition-opacity group-hover:opacity-0 whitespace-nowrap",
                  isActive
                    ? "text-white/80"
                    : "text-muted-foreground"
                )}
              >
                {timeAgo(chat?.last_message_time, locale, t)}
              </span>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center justify-between gap-2 min-w-0">

              {
                !isSelling ? (
                  <p
                    className={cn(
                      "truncate text-sm",
                      isActive
                        ? "text-white"
                        : "text-muted-foreground"
                    )}
                    title={chat?.seller?.name}
                  >
                    {chat?.seller?.name}
                  </p>
                )
                  :
                  (
                    chat?.last_chat_message ? (
                      <p
                        className={cn(
                          "truncate text-sm",
                          isActive
                            ? "text-white"
                            : "text-muted-foreground"
                        )}
                        title={chat?.last_chat_message}
                      >
                        {chat?.last_chat_message}
                      </p>
                    ) : (
                      <div />
                    )
                  )
              }
              {isUnread && !isActive && (
                <span className="flex items-center justify-center bg-primary text-white rounded-full px-2 py-1 text-xs shrink-0">
                  {chat?.unread_chat_count}
                </span>
              )}
            </div>
          </div>
        </div>
      </CustomLink>

      {/* Dropdown (OUTSIDE the link) */}
      {!selectMode && (
        <div className="absolute ltr:right-4 rtl:left-4 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "p-1 rounded-full transition duration-150 opacity-0 group-hover:opacity-100",
                  isActive
                    ? "hover:bg-blue-100/20"
                    : "hover:bg-gray-200"
                )}
              >
                <DotsThreeVerticalIcon size={16} weight="bold" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align={isRTL ? "start" : "end"}>
              <DropdownMenuItem onClick={handleSelectClick}>
                {t("select")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleBlock}>
                {isBlocked ? t("unblock") : t("block")}
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onRequestDelete(chat.id)}
              >
                {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default ChatListCard;