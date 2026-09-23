"use client";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  deleteToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import firebase from "firebase/compat/app";
import { getAuth } from "firebase/auth";
import { toast } from "sonner";
import { getFcmToken } from "@/store/slices/settingSlice";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const authentication = getAuth(app);

const FirebaseData = ({ t, onMessagingUnsupported } = {}) => {
  const firebaseApp = app;

  const messagingInstance = async () => {
    try {
      const isSupportedBrowser = await isSupported();
      if (isSupportedBrowser) {
        return getMessaging(firebaseApp);
      } else {
        onMessagingUnsupported?.();
        return null;
      }
    } catch (err) {
      console.error("Error checking messaging support:", err);
      return null;
    }
  };
  const fetchToken = async (setFcmToken) => {
    try {
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        const messaging = await messagingInstance();
        if (!messaging) {
          console.error("Messaging not supported.");
          return;
        }
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
          })
            .then((currentToken) => {
              if (currentToken) {
                getFcmToken(currentToken);
                setFcmToken(currentToken);
              } else {
                console.error("No token found");
                toast.error(t("permissionRequired"));
              }
            })
            .catch((err) => {
              console.error("Error retrieving token:", err);
              // If the error is "no active Service Worker", try to register the service worker again
              if (err.message.includes("no active Service Worker")) {
                registerServiceWorker();
              }
            });
        } else {
          console.error("Permission not granted");
        }
      }
    } catch (err) {
      console.error("Error requesting notification permission:", err);
    }
  };

  const registerServiceWorker = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registration successful with scope: ",
            registration.scope
          );
          // After successful registration, try to fetch the token again
          fetchToken();
        })
        .catch((err) => {
          console.log("Service Worker registration failed: ", err);
        });
    }
  };

  // Return this device's FCM token and unregister it, so logout/delete
  // can hand it to the backend and stop push to this browser.
  const revokeToken = async () => {
    const messaging = await messagingInstance();
    if (!messaging) return "";

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
    }).catch((err) => {
      console.error("revokeToken: getToken failed", err);
      return "";
    });

    await deleteToken(messaging).catch((err) => {
      console.error("revokeToken: deleteToken failed", err);
    });

    return token || "";
  };

  const onMessageListener = async (callback) => {
    const messaging = await messagingInstance();
    if (messaging) {
      return onMessage(messaging, callback);
    } else {
      console.error("Messaging not supported.");
      return null;
    }
  };
  const signOut = () => {
    return authentication.signOut();
  };
  return {
    firebase,
    authentication,
    fetchToken,
    onMessageListener,
    revokeToken,
    signOut,
  };
};

export default FirebaseData;
