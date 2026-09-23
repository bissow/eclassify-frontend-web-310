import { useRef } from "react";
import { useSelector } from "react-redux";
import { getNotification } from "@/store/slices/globalStateSlice";

// Latest push, but only once — a stale or already-consumed one returns null.
const useNewNotification = () => {
  const notification = useSelector(getNotification);
  const lastId = useRef(notification?.id);

  if (!notification?.id || notification.id === lastId.current) return null;
  lastId.current = notification.id;
  return notification;
};

export default useNewNotification;
