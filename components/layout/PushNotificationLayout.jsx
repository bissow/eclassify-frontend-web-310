"use client";
import { useEffect, useRef, useState } from "react";
import "firebase/messaging";
import FirebaseData from "@/lib/firebase";
import { useDispatch, useSelector } from "react-redux";
import { setNotification } from "@/store/slices/globalStateSlice";
import { receiveChatMessage } from "@/store/slices/chatSlice";
import { useNavigate } from "@/hooks/useNavigate";
import { usePathname, useSearchParams } from "next/navigation";
import { isNotificationForOpenChat } from "@/features/chat/hooks/useChatMessages";
import {
  getIsLoggedIn,
  getStoredFcmId,
  increaseUnreadChatCount,
  loadUpdateUserData,
  userSignUpData,
} from "@/store/slices/authSlice";
import { updateProfileApi } from "@/lib/api";
import { getFaviconUrl, settingsData } from "@/store/slices/settingSlice";
import { useTranslation } from "@/lang/useTranslation";
import { useClientLayoutLogic } from "./useClientLayoutLogic";

// Shown when the browser can't do FCM (no HTTPS, older Safari/iOS).
const MessagingUnsupportedNote = () => {
  const { t } = useTranslation();
  const settings = useSelector(settingsData);
  const [dismissed, setDismissed] = useState(false);

  const playStoreLink = settings?.play_store_link;
  const appStoreLink = settings?.app_store_link;

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 z-99999 w-full bg-white p-2.5 text-center text-sm text-black">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="float-right cursor-pointer text-xl leading-none"
        aria-label={t("close")}
      >
        &times;
      </button>
      <span>{t("chatAndNotificationNotSupported")}</span>
      <div className="inline-block">
        {playStoreLink && (
          <a href={playStoreLink} target="_blank" rel="noopener noreferrer" className="text-[#3498db] underline">
            {t("playStore")}
          </a>
        )}
        {appStoreLink && (
          <a href={appStoreLink} target="_blank" rel="noopener noreferrer" className="ml-1 text-[#3498db] underline">
            {t("appStore")}
          </a>
        )}
      </div>
    </div>
  );
};

const PushNotificationLayout = ({ children }) => {
  useClientLayoutLogic();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [fcmToken, setFcmToken] = useState("");
  const [messagingUnsupported, setMessagingUnsupported] = useState(false);
  const { fetchToken, onMessageListener } = FirebaseData({
    t,
    onMessagingUnsupported: () => setMessagingUnsupported(true),
  });
  const { navigate } = useNavigate();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLoggedIn = useSelector(getIsLoggedIn);
  const storedFcmId = useSelector(getStoredFcmId);
  const userData = useSelector(userSignUpData);
  const unsubscribeRef = useRef(null);
  const faviconUrl = useSelector(getFaviconUrl);

  const handleFetchToken = async () => {
    await fetchToken(setFcmToken);
  };

  // Fetch token when user logs in
  useEffect(() => {
    handleFetchToken();
  }, []);

  // Set up message listener when logged in, clean up when logged out
  useEffect(() => {
    if (!isLoggedIn) {
      // Clean up listener when user logs out
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      return;
    }

    // Set up listener when user logs in
    const setupListener = async () => {
      try {
        unsubscribeRef.current = await onMessageListener((payload) => {
          if (payload && payload.data) {
            dispatch(setNotification(payload.data));
            // No popup for a message in the already-open conversation.
            const isViewingThisChat =
              pathname.includes("/chat") &&
              isNotificationForOpenChat(payload.data, {
                chatId: Number(searchParams.get("chatid")),
                isSelling: (searchParams.get("activeTab") || "selling") === "selling",
              });

            // Bump the badge only when not already looking at the chat.
            if (
              !isViewingThisChat &&
              (payload.data.type === "chat" || payload.data.type === "offer")
            ) {
              dispatch(
                increaseUnreadChatCount({ isSelling: payload.data.user_type !== "Seller" })
              );
              dispatch(
                receiveChatMessage({
                  chatId: Number(payload.data.item_offer_id),
                  message: payload.data.body || payload.data.message,
                  time: payload.data.created_at,
                })
              );
            }

            if (!isViewingThisChat && Notification.permission === "granted") {

              const options = {
                body: payload?.notification?.body || "",
              };

              if (faviconUrl) {
                options.icon = faviconUrl;
              }

              if (payload?.notification?.image) {
                options.image = payload.notification.image;
              }

              const notif = new Notification(payload.notification.title, options);
              const tab =
                payload.data?.user_type === "Seller" ? "buying" : "selling";

              notif.onclick = () => {
                if (
                  payload.data.type === "chat" ||
                  payload.data.type === "offer"
                ) {
                  navigate(
                    `/chat?activeTab=${tab}&chatid=${payload.data?.item_offer_id}&chat_ad_id=${payload.data?.item_id}`
                  );
                }
              };
            }
          }
        });
      } catch (err) {
        console.error("Error handling foreground notification:", err);
      }
    };

    setupListener();

    // Cleanup on unmount or logout
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isLoggedIn, dispatch, navigate, onMessageListener]);

  useEffect(() => {
    if (fcmToken) {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/firebase-messaging-sw.js")
          .then((registration) => {
            console.log(
              "Service Worker registration successful with scope: ",
              registration.scope
            );
          })
          .catch((err) => {
            console.log("Service Worker registration failed: ", err);
          });
      }
    }
  }, [fcmToken]);

  // Sync the token to the backend on Firebase rotation or when it has no row for it.
  useEffect(() => {
    if (!fcmToken || !isLoggedIn) return;
    const tokens = userData?.fcm_tokens;
    // Trust the backend list; else fall back to the last synced value.
    const knownToBackend = Array.isArray(tokens)
      ? tokens.some((t) => t?.fcm_token === fcmToken)
      : fcmToken === storedFcmId;
    if (knownToBackend) return;
    const syncToken = async () => {
      try {
        await updateProfileApi.updateProfile({ fcm_id: fcmToken });
        loadUpdateUserData({ ...userData, fcm_id: fcmToken });
      } catch (err) {
        console.error("fcm token sync failed", err);
      }
    };
    syncToken();
  }, [fcmToken, isLoggedIn, storedFcmId, userData?.fcm_tokens]);

  return (
    <>
      {children}
      {messagingUnsupported && <MessagingUnsupportedNote />}
    </>
  );
};

export default PushNotificationLayout;
