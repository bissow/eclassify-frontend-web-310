"use client";
import { useState } from "react";
import { useTranslation } from "@/lang/useTranslation";

// Only the tab state is client-side. Both panels are server-rendered nodes
// passed in as slots, so switching tabs never triggers a fetch.
const SellerTabs = ({ listings, reviews }) => {
  const { t } = useTranslation();
  const [steps, setSteps] = useState(1);

  return (
    <>
      <div className="p-4 flex items-center gap-4 bg-muted border rounded-md w-full">
        <button
          onClick={() => setSteps(1)}
          className={`py-2 px-4 rounded-md ${steps === 1 ? "bg-primary text-white" : ""
            }`}
        >
          {t("liveAds")}
        </button>
        <button
          onClick={() => setSteps(2)}
          className={`py-2 px-4 rounded-md ${steps === 2 ? "bg-primary text-white" : ""
            }`}
        >
          {t("reviews")}
        </button>
      </div>

      {/* Kept mounted and hidden — the inactive panel holds server data plus any
          pages the user already loaded more of. */}
      <div className={`flex flex-col gap-8 ${steps === 1 ? "" : "hidden"}`}>
        {listings}
      </div>
      <div className={`flex flex-col gap-8 ${steps === 2 ? "" : "hidden"}`}>
        {reviews}
      </div>
    </>
  );
};

export default SellerTabs;
