"use client";
import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, setStore } from ".";

// settings/languageData/categoryData are fetched server-side (app/[lang]/layout.jsx)
// and seed the store's preloadedState, so first paint — server and client — has
// real data instead of racing a post-hydration dispatch.
export function Providers({ settings, languageData, categoryData, children }) {
  const storeRef = useRef(null);

  if (!storeRef.current) {
    storeRef.current = makeStore({
      Settings: { data: settings, lastFetch: null, loading: false, fcmToken: null },
      CurrentLanguage: { language: languageData || {} },
      Category: {
        cateData: categoryData?.cateData || [],
        catCurrentPage: categoryData?.currentPage || 1,
        catLastPage: categoryData?.lastPage || 1,
        isCatLoading: false,
        isCatLoadMore: false,
      },
    });
    if (typeof window !== "undefined") setStore(storeRef.current);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
