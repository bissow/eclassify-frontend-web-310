"use client";
import { sendMessageApi } from "@/lib/api";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSelectedChat,
  appendMessage,
  patchSelectedChat,
} from "@/store/slices/chatSlice";
import { CircleNotchIcon, MicrophoneIcon, PaperPlaneRightIcon, StopCircleIcon, UploadSimpleIcon, XIcon } from "@phosphor-icons/react";
import { useReactMediaRecorder } from "react-media-recorder";
import { toast } from "sonner";
import { useTranslation } from "@/lang/useTranslation";
import CustomImage from "@/components/common/CustomImage";
import { SendMessageSkeleton } from "@/features/chat/ChatSkeletons";
import QuickReplies from "./QuickReplies";

const ComposerNotice = ({ children }) => (
  <div className="p-4 border-t text-center text-muted-foreground">{children}</div>
);

// Gate only — MessageComposer mounts only when sending is actually allowed.
const SendMessage = ({ chatId, quickReplies, isLoadingQuickReplies }) => {
  const { t } = useTranslation();
  const selectedChatDetails = useSelector(getSelectedChat);
  const status = selectedChatDetails?.item?.status;
  const isAllowToChat = status === "approved" || status === "featured";

  if (!selectedChatDetails) return <SendMessageSkeleton />;

  if (!isAllowToChat) {
    return (
      <ComposerNotice>
        {t("thisAd")} {status}
      </ComposerNotice>
    );
  }

  if (selectedChatDetails?.user_blocked) {
    return <ComposerNotice>{t("youBlockedThisContact")}</ComposerNotice>;
  }

  if (selectedChatDetails?.is_my_user_blocked) {
    return <ComposerNotice>{t("youveBeenBlockedByThisUser")}</ComposerNotice>;
  }

  return (
    <MessageComposer
      chatId={chatId}
      quickReplies={quickReplies}
      isLoadingQuickReplies={isLoadingQuickReplies}
    />
  );
};

const MessageComposer = ({ chatId, quickReplies, isLoadingQuickReplies }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const id = chatId;
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const fileInputRef = useRef(null);

  // Voice recording setup
  const { status, startRecording, stopRecording, mediaBlobUrl, error } =
    useReactMediaRecorder({
      audio: true,
    });

  const isRecording = status === "recording";
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Format recording duration as mm:ss
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Timer for recording
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }

    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      stopRecording();
    };
  }, []);

  // Handle recorded audio
  useEffect(() => {
    if (mediaBlobUrl && status === "stopped") {
      handleRecordedAudio();
    }
  }, [mediaBlobUrl, status]);

  const handleRecordedAudio = async () => {
    try {
      const response = await fetch(mediaBlobUrl);
      const blob = await response.blob();
      const extension = blob.type.split("/")[1]?.split(";")[0] || "webm";
      const audioFile = new File([blob], `recording.${extension}`, {
        type: blob.type,
      });
      sendMessage(audioFile);
    } catch (err) {
      console.error("Error processing audio:", err);
      toast.error("Failed to process recording");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only image files (JPEG, PNG, JPG) are allowed");
      return;
    }

    // Create preview URL for image
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    setSelectedFile(file);
  };

  const removeSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    // Allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async (audioFile = null, overrideText = null) => {
    const textToSend = overrideText !== null ? overrideText : message;
    if ((!textToSend.trim() && !selectedFile && !audioFile) || isSending) return;

    const params = {
      item_offer_id: id,
      message: textToSend ? textToSend : "",
      file: selectedFile ? selectedFile : "",
      audio: audioFile ? audioFile : "",
    };

    try {
      setIsSending(true);
      const response = await sendMessageApi.sendMessage(params);
      if (!response?.data?.error) {
        dispatch(appendMessage(response.data.data));
        if (overrideText === null) setMessage("");
        removeSelectedFile();
        setShowQuickReplies(false);
      } else if (response?.data?.data?.key === 'blocked_by_other_user') {
        toast.error(t("youveBeenBlockedByThisUser"));
        dispatch(patchSelectedChat({ is_my_user_blocked: true }));
      } else {
        toast.error(response?.data?.message || "Failed to send message");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error sending message");
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickReply = (text) => {
    sendMessage(null, text);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) setShowQuickReplies(false);
  };

  const handleVoiceButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
      if (error) {
        console.log(error);
        switch (error) {
          case "permission_denied":
            toast.error(t("microphoneAccessDenied"));
            break;
          case "no_specified_media_found":
            toast.error(t("noMicrophoneFound"));
            break;
          default:
            toast.error(t("somethingWentWrong"));
        }
      }
    }
  };


  const isShowQuickReply =
    !selectedFile && !isLoadingQuickReplies && quickReplies.length > 0

  return (
    <div className="flex flex-col shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.08)]">
      {/* File Preview */}
      {previewUrl && (
        <div className="px-4 pt-2 pb-1">
          <div className="relative w-32 h-32 border rounded-md overflow-hidden group">
            <CustomImage
              src={previewUrl}
              alt="File preview"
              fill
              className="object-contain"
            />
            <button
              onClick={removeSelectedFile}
              className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-70 hover:opacity-100"
            >
              <XIcon size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Quick Reply */}
      {isShowQuickReply && (
        <>
          <QuickReplies
            replies={quickReplies}
            onSelect={handleQuickReply}
            disabled={isSending || isRecording}
            open={showQuickReplies}
            onOpenChange={setShowQuickReplies}
          />
          <div className="mx-4 border-t border-dashed" />
        </>
      )}

      {/* Input Area */}
      <div className="p-4 flex items-center gap-2">
        {!isRecording && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              aria-label="Attach file"
            >
              <UploadSimpleIcon size={20} className="text-muted-foreground" weight="bold" />
            </button>
          </>
        )}

        {isRecording ? (
          <div className="flex-1 py-2 px-3 bg-red-50 text-red-500 rounded-md flex items-center justify-center font-medium">
            {t("recording")} {formatDuration(recordingDuration)}
          </div>
        ) : (
          <textarea
            placeholder="Message..."
            className="flex-1 outline-hidden border px-3 py-2 rounded-md resize-none field-sizing-content min-h-10 max-h-32 overflow-y-auto"
            value={message}
            rows={1}
            onChange={handleMessageChange}
          />
        )}

        <button
          className="p-2 bg-primary text-white rounded-md"
          disabled={isSending}
          onClick={
            message.trim() || selectedFile
              ? () => sendMessage()
              : handleVoiceButtonClick
          }
        >
          {isSending ? (
            <CircleNotchIcon size={20} className="animate-spin" weight="bold" />
          ) : message.trim() || selectedFile ? (
            <PaperPlaneRightIcon size={20} className="rtl:scale-x-[-1]" weight="fill" />
          ) : isRecording ? (
            <StopCircleIcon size={20} weight="bold" />
          ) : (
            <MicrophoneIcon size={20} weight="fill" />
          )}
        </button>
      </div>
    </div>
  );
};

export default SendMessage;
