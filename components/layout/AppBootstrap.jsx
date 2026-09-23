"use client";
import dynamic from "next/dynamic";
import { ProgressProvider } from "@bprogress/next/app";
import PushNotificationLayout from "./PushNotificationLayout";

// Non-critical, loaded as separate chunks off the hydration path.
const ScrollToTopButton = dynamic(() => import("./ScrollToTopButton"), { ssr: false });
const AnalyticsLoader = dynamic(() => import("./AnalyticsLoader"), { ssr: false });
const CookieBanner = dynamic(() => import("./CookieBanner").then((m) => m.CookieBanner), { ssr: false });
const Toaster = dynamic(() => import("@/components/ui/sonner").then((m) => m.Toaster), { ssr: false });

// Entry point for client-side app-boot concerns.
export default function AppBootstrap({ children }) {
  return (
    <ProgressProvider
      color="var(--primary)"
      height="5px"
      options={{ showSpinner: false }}
      shallowRouting
      disableSameURL={false}
    >
      <PushNotificationLayout>
        {children}
        <ScrollToTopButton />
        <AnalyticsLoader />
        <CookieBanner />
      </PushNotificationLayout>
      <Toaster position="top-center" theme="light" closeButton={true} />
    </ProgressProvider>
  );
}
