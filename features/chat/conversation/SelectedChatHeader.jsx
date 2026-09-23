import { useTranslation } from "@/lang/useTranslation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomLink from "@/components/common/CustomLink";
import { deleteChatMessagesApi } from "@/lib/api";
import useChatSelectMode from "@/features/chat/hooks/useChatSelectMode";
import useChatBlockUser from "@/features/chat/hooks/useChatBlockUser";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { getIsRtl } from "@/store/slices/languageSlice";
import {
  getSelectedChat,
  getMessageSelectMode,
  getSelectedMessageIds,
  removeMessages,
  setMessageSelectMode,
  patchSelectedChat,
  appendMessage,
} from "@/store/slices/chatSlice";
import CustomImage from "@/components/common/CustomImage";
import UserAvatar from "@/components/common/UserAvatar";
import { ArrowLeftIcon, CircleNotchIcon, DotsThreeVerticalIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import MakeOfferModal from "@/features/ad-details/MakeOfferModal";

const SelectedChatHeader = ({ isSelling, handleBack, chatId }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const selectedChat = useSelector(getSelectedChat);
  const selectMode = useSelector(getMessageSelectMode);
  const selectedMessages = useSelector(getSelectedMessageIds);
  const isBlocked = selectedChat?.user_blocked;
  const userData = isSelling ? selectedChat?.buyer : selectedChat?.seller;
  const itemData = selectedChat?.item;
  const itemStatus = itemData?.status;
  const isItemActive = itemStatus === "approved" || itemStatus === "featured";
  const isRTL = useSelector(getIsRtl);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const {
    isDeleteModalOpen, setIsDeleteModalOpen,
    isDeleting: isChatDeleting, handleBulkDelete: handleDeleteChat,
    requestDelete,
  } = useChatSelectMode({ isSelling });

  const toggleBlock = useChatBlockUser();

  const handleToggleBlock = () =>
    toggleBlock(userData?.id, !isBlocked, selectedChat?.id);

  const handleOfferSuccess = (offer, mode) => {
    const formattedAmount =
      mode === "edit" ? offer?.formatted_amount : offer?.item_offer_formatted_amount;

    dispatch(
      patchSelectedChat({ amount: offer?.amount, formatted_amount: formattedAmount })
    );

    if (mode === "edit") {
      dispatch(appendMessage(offer));
    } else {
      // create's response is offer-shaped, not message-shaped — build the row.
      dispatch(
        appendMessage({
          id: `temp-offer-${offer?.id}`,
          item_offer_id: offer?.id,
          sender_id: offer?.buyer_id,
          created_at: offer?.created_at,
          is_offer: 1,
          amount: offer?.amount,
          formatted_amount: formattedAmount,
        })
      );
    }
  };

  const handleDeleteMessages = async () => {
    if (selectedMessages.length === 0) return;
    try {
      setIsDeleting(true)
      const response = await deleteChatMessagesApi.deleteChatMessages({
        item_offer_id: chatId,
        message_ids: selectedMessages,
      });
      if (response?.data?.error === false) {
        toast.success(response?.data?.message);
        dispatch(removeMessages(selectedMessages));
        dispatch(setMessageSelectMode(false));
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(t("somthingWentWrong"));
    } finally {
      setIsDeleting(false)
    }
  };


  return (
    <>
      <div className="flex items-center justify-between gap-1 px-4 py-3 border-b">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button onClick={handleBack} className={cn(
            "block xl:hidden"
          )}>
            <ArrowLeftIcon size={20} weight="bold" />
          </button>

          <div className="relative shrink-0">
            <CustomLink href={`/seller/${userData?.id}`}>
              <UserAvatar
                src={userData?.profile}
                initial={userData?.initial}
                avatarColor={userData?.avatar_color}
                alt="avatar"
                size={56}
                className="size-12! sm:size-14!"
              />
            </CustomLink>
            <CustomImage
              src={itemData?.image}
              alt="avatar"
              width={24}
              height={24}
              className="size-5 sm:size-6 aspect-square object-cover rounded-full absolute top-8 -bottom-1.5 -right-1 sm:-right-1.5"
            />
          </div>
          <div className="flex flex-col gap-2 w-full min-w-0">
            <CustomLink
              href={`/seller/${userData?.id}`}
              className="text-sm sm:text-base font-medium truncate"
              title={userData?.name}
            >
              {userData?.name}
            </CustomLink>
            <p
              className="truncate text-xs sm:text-sm"
              title={itemData?.translation?.name}
            >
              {itemData?.translation?.name}
            </p>
          </div>
        </div>
        {/* Dropdown Menu for Actions */}
        <div className="flex items-center gap-4">
          {selectMode ? (
            <div className="flex items-center gap-3">
              <span className="text-sm">
                {selectedMessages.length} {t("selected")}
              </span>
              <button
                onClick={handleDeleteMessages}
                className="text-destructive"
                title={t("delete")}
                disabled={selectedMessages.length === 0 || isDeleting}
              >
                {
                  isDeleting ? <CircleNotchIcon className="size-5 animate-spin" weight="bold" /> : <TrashIcon size={20} />
                }
              </button>
              <button
                onClick={() => dispatch(setMessageSelectMode(false))}
                title={t("cancel")}
              >
                <XIcon size={20} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="self-end">
                    <DotsThreeVerticalIcon size={22} weight="bold" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "start" : "end"}>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={handleToggleBlock}
                  >
                    <span>{isBlocked ? t("unblock") : t("block")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive"
                    onClick={() => requestDelete(selectedChat?.id)}
                  >
                    <span>{t("deleteChat")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="text-xs whitespace-nowrap">
                {itemData?.formatted_price || itemData?.formatted_salary_range}
              </div>
            </div>
          )}
        </div>
      </div>

      {isItemActive && Number(itemData?.price) > 0 && (selectedChat?.amount || !isSelling) && (
        <div className="p-3 sm:p-4 border-b flex items-center justify-between gap-1">
          {selectedChat?.amount ? (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-xs sm:text-sm text-muted-foreground">{t('currentOffer')}</span>
                <p className="text-sm sm:text-base font-semibold">{selectedChat?.formatted_amount}</p>
              </div>
              <button
                onClick={() => setIsOfferModalOpen(true)}
                className="px-2 py-1 bg-primary rounded text-white"
              >
                {t('edit')}
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <p className="text-sm sm:text-base font-medium">{t('makeOffer')}</p>
                <span className="text-xs sm:text-sm">{t('setPriceAndOffer')}</span>
              </div>
              <button
                onClick={() => setIsOfferModalOpen(true)}
                className="px-2 py-1 bg-primary rounded text-white"
              >
                {t('makeOffer')}
              </button>
            </>
          )}
        </div>
      )}
      <DeleteConfirmDialog
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteChat}
        title={t("deleteChat")}
        description={t("deleteChatDescription")}
        confirmDisabled={isChatDeleting}
      />
      <MakeOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSuccess={handleOfferSuccess}
        mode={selectedChat?.amount ? "edit" : "create"}
        initialAmount={selectedChat?.amount ? String(selectedChat.amount) : ""}
        itemId={itemData?.id}
        itemOfferId={chatId}
        price={itemData?.price}
        currency={itemData?.currency}
        formattedPrice={itemData?.formatted_price}
        key={`offer-modal-${isOfferModalOpen}`}
      />
    </>
  );
};

export default SelectedChatHeader;
