import { useTranslation, useLocale } from "@/lang/useTranslation";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/slices/settingSlice";
import { formatPriceAbbreviated, timeAgo } from "@/lib/format";
import CustomLink from "@/components/common/CustomLink";
import CustomImage from "@/components/common/CustomImage";
import UserAvatar from "@/components/common/UserAvatar";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { getChatAdListApi } from "@/lib/api";
import NoData from "@/components/empty-states/NoData";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import usePaginatedList from "@/features/chat/hooks/usePaginatedList";
import useNewNotification from "@/features/chat/hooks/useNewNotification";
import ChatListToolbar from "@/features/chat/list/ChatListToolbar";
import { AdListSkeleton } from "@/features/chat/ChatSkeletons";

// Selling tab: the seller's own ads, each linking to that ad's buyer chats.
const AdList = () => {
  const { t } = useTranslation();
  const langCode = useSearchParams().get("lang");

  const searchParams = useSearchParams();
  const notification = useNewNotification();

  const {
    list, currentPage, hasMore, isLoading, isLoadMore,
    search, setSearch, load, patchList,
  } = usePaginatedList(({ page, search }) =>
    getChatAdListApi.getChatAdList({ type: "seller", page, search })
  );

  const debouncedFetch = useDebouncedCallback((value) => load(1, value), 800);

  const sentinelRef = useInfiniteScroll(() => load(currentPage + 1, search), {
    hasMore,
    isLoading: isLoading || isLoadMore,
  });

  useEffect(() => {
    load(1);
  }, [langCode]);

  // Optimistic: a live chat/offer push bumps the matching ad's unread pill.
  useEffect(() => {
    if (!notification || (notification.type !== "chat" && notification.type !== "offer")) return;

    const adId = Number(notification.item_id);
    if (!adId || Number(searchParams.get("chat_ad_id")) === adId) return;
    patchList((prev) => {
      const idx = prev.list.findIndex((ad) => Number(ad.id) === adId);
      if (idx === -1) return prev;
      const list = [...prev.list];
      const [row] = list.splice(idx, 1);
      list.unshift({
        ...row,
        unread_chat_count: (Number(row.unread_chat_count) || 0) + 1,
        last_offer_updated: notification.created_at || row.last_offer_updated,
      });
      return { ...prev, list };
    });
  }, [notification]);

  return (
    <>
      <ChatListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          debouncedFetch(value);
        }}
      />

      <div className="flex-1 overflow-y-auto flex flex-col p-2 sm:p-4 gap-4 pt-0!">
        {isLoading ? (
          <AdListSkeleton />
        ) : list.length > 0 ? (
          <>
            {list.map((chat) => (
              <AdCard key={chat.id} chat={chat} />
            ))}
            {hasMore && (
              <div ref={sentinelRef} className="py-2">
                <AdListSkeleton count={1} />
              </div>
            )}
          </>
        ) : (
          <NoData title={t("noChatFound")} />
        )}
      </div>
    </>
  );
};

export default AdList;

const AdCard = ({ chat }) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const settings = useSelector(settingsData);
  const unreadCount = chat.unread_chat_count;
  const time = timeAgo(chat.last_offer_updated, locale, t);
  const displayUsers = chat.other_users || [];
  const totalCount = chat.total_other_users || displayUsers.length;
  const extraUsers = Math.max(0, totalCount - displayUsers.length);

  return (
    <CustomLink
      href={`/chat?activeTab=selling&chat_ad_id=${chat.id}`}
      scroll={false}
      className="p-2 sm:p-4 border rounded-xl flex items-center gap-4"
    >
      <CustomImage
        src={chat.image}
        alt={chat.name}
        width={44}
        height={44}
        className="object-cover aspect-square rounded-full"
      />
      {/* Content */}
      <div className="flex-1 min-w-0 ltr:text-left rtl:text-right">
        <h5 className="font-medium line-clamp-2 mb-1 text-gray-900">
          {chat.name}
        </h5>
        <div className={cn("flex items-center flex-wrap gap-y-1", chat.price && "gap-x-2")}>
          <span className="font-bold whitespace-nowrap text-gray-900">
            {formatPriceAbbreviated(chat.price, t, settings)}
          </span>

          {displayUsers.length > 0 && (
            <>
              {chat.price && <span className="w-1 h-1 bg-muted-foreground rounded-full hidden sm:block" />}
              {/* User Avatars Stack & Extra Count */}
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="flex -space-x-2 overflow-hidden py-0.5 shrink-0">
                  {displayUsers.map((user, idx) => (
                    <div key={idx} className="relative size-5 rounded-full overflow-hidden border border-white shadow-xs shrink-0">
                      <UserAvatar
                        src={user.profile || ""}
                        initial={user?.initial}
                        avatarColor={user?.avatar_color}
                        alt={user.name || "Chat Ad"}
                        size={20}
                      />
                    </div>
                  ))}
                </div>
                {extraUsers > 0 && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    +{extraUsers}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col items-end justify-between h-full py-0.5 shrink-0">
        <span className={cn("text-xs mb-2", unreadCount > 0 ? "font-bold" : "font-medium text-muted-foreground")}>
          {time}
        </span>
        {unreadCount > 0 ? (
          <div className="flex items-center justify-center min-w-5 h-5 bg-primary text-white text-xs font-bold rounded-full px-1.5 shadow-xs">
            {unreadCount}
          </div>
        ) : (
          <div className="h-5" />
        )}
      </div>
    </CustomLink>
  );
};
