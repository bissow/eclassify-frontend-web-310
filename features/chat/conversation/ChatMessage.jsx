import { useRef } from "react";
import { useTranslation } from "@/lang/useTranslation";
import { cn } from "@/lib/utils";
import CustomImage from "@/components/common/CustomImage";
import { Checkbox } from "@/components/ui/checkbox";
import { PhotoView } from "react-photo-view";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Fresh audio can 404 briefly; force one reload after an error.
const AudioMessage = ({ src, isCurrentUser }) => {
  const audioRef = useRef(null);
  const retriedRef = useRef(false);

  const handleError = (e) => {
    if (retriedRef.current) return;
    retriedRef.current = true;
    setTimeout(() => audioRef.current?.load(), 1500);
  };

  return (
    <audio
      ref={audioRef}
      src={src}
      controls
      className={cn("w-full sm:w-[80%] rounded-md", isCurrentUser ? "self-end" : "self-start")}
      controlsList="nodownload"
      preload="metadata"
      onError={handleError}
    />
  );
};

const MessageBody = ({ message, isCurrentUser }) => {
  const bubble = isCurrentUser
    ? "text-foreground bg-primary/10 p-2 rounded-md w-fit"
    : "text-foreground bg-muted p-2 rounded-md w-fit";

  switch (message.message_type) {
    case "audio":
      return <AudioMessage src={message.audio} isCurrentUser={isCurrentUser} />;

    case "file":
      return (
        <div className={bubble}>
          <MessageImage src={message.file} />
        </div>
      );

    case "file_and_text":
      return (
        <div className={cn(bubble, "flex flex-col gap-2")}>
          <MessageImage src={message.file} />
          <div className="border-white/20 break-all">{message.message}</div>
        </div>
      );

    default:
      return (
        <p
          className={cn(
            bubble,
            "whitespace-pre-wrap break-all",
            isCurrentUser ? "self-end ltr:pr-8 rtl:pl-8" : "self-start"
          )}
        >
          {message?.message}
        </p>
      );
  }
};

// Fixed box: row height known before the image decodes, so the list doesn't shift.
const MessageImage = ({ src }) => (
  <PhotoView src={src}>
    <div className="relative w-45 h-45 sm:w-62.5 sm:h-62.5 rounded-md overflow-hidden bg-muted cursor-pointer">
      <CustomImage src={src} alt="Chat Image" fill sizes="(max-width: 640px) 180px, 250px" className="object-cover" />
    </div>
  </PhotoView>
);

// One row: optional date separator, the bubble, optional timestamp.
const ChatMessage = ({
  msg,
  isCurrentUser,
  otherPartyName,
  date,
  time,
  showDate,
  showTime,
  selectMode,
  isSelected,
  onToggleSelect,
  onStartSelect,
  onDelete,
  isRTL,
}) => {
  const { t } = useTranslation();
  const isAudio = msg.message_type === "audio";
  const toggle = () => onToggleSelect(msg.id);
  // select/delete gated on isCurrentUser — API only deletes your own messages.

  const dateSeparator = showDate && (
    <p className="text-xs bg-muted py-1 px-2 rounded-lg text-muted-foreground my-5 mx-auto">
      {date}
    </p>
  );

  // Offers render as a centered event line, not a chat bubble.
  if (msg.is_offer) {
    return (
      <>
        {dateSeparator}
        <p className="text-sm bg-muted py-1.5 px-3 rounded-lg text-muted-foreground mx-auto my-1 text-center max-w-[80%]">
          {isCurrentUser
            ? `${t("youOffered")} ${msg.formatted_amount}`
            : `${otherPartyName || t("seller")} ${t("offeredLower")} ${msg.formatted_amount}`}
        </p>
      </>
    );
  }

  return (
    <>
      {dateSeparator}

      <div
        className={cn(
          "flex flex-col gap-1 max-w-[80%]",
          isCurrentUser && "self-end",
          isAudio && "w-full"
        )}
      >
        <div
          className={cn(
            "relative group w-fit flex items-center gap-3",
            isCurrentUser ? "self-end" : "self-start",
            selectMode && isCurrentUser && "cursor-pointer",
            isAudio && "w-full"
          )}
          onClick={selectMode && isCurrentUser ? toggle : undefined}
        >
          <div
            className={cn(
              "flex-1",
              isAudio && cn("w-full flex", isCurrentUser ? "justify-end" : "justify-start")
            )}
          >
            <MessageBody message={msg} isCurrentUser={isCurrentUser} />
          </div>

          {selectMode && isCurrentUser && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={toggle}
              onClick={(e) => e.stopPropagation()}
              className="rounded-full"
            />
          )}

          {isCurrentUser && !selectMode && (
            <div className="absolute bottom-1 ltr:right-1 rtl:left-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-black/10 text-foreground outline-hidden">
                    <DotsThreeVerticalIcon weight="bold" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "start" : "end"}>
                  <DropdownMenuItem
                    className="cursor-pointer text-sm font-medium"
                    onClick={() => onStartSelect(msg.id)}
                  >
                    {t("select")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-sm font-medium text-destructive"
                    onClick={() => onDelete(msg.id)}
                  >
                    {t("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {showTime && (
          <p
            className={cn(
              "text-xs text-muted-foreground",
              isCurrentUser ? "ltr:text-right rtl:text-left" : "ltr:text-left rtl:text-right"
            )}
          >
            {time}
          </p>
        )}
      </div>
    </>
  );
};

export default ChatMessage;
