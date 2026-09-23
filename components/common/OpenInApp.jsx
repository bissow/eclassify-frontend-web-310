"use client";
import { useEffect, useState } from "react";
import OpenInAppDrawer from "./OpenInAppDrawer";

// Wraps the deep-link drawer with its own device check so pages only declare
// whether the prompt applies to them.
const OpenInApp = ({ enabled = true }) => {
  const [isOpenInApp, setIsOpenInApp] = useState(false);

  useEffect(() => {
    if (enabled && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
      setIsOpenInApp(true);
    }
  }, [enabled]);

  return (
    <OpenInAppDrawer
      isOpenInApp={isOpenInApp}
      setIsOpenInApp={setIsOpenInApp}
    />
  );
};

export default OpenInApp;
