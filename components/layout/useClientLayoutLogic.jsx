import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getMinRange, getMaxRange } from "@/store/slices/settingSlice";
import { getKmRangeClient, saveKilometerRange } from "@/lib/location";
import { getIsRtl } from "@/store/slices/languageSlice";
import { getIsLoggedIn } from "@/store/slices/authSlice";
import { useLanguageSync } from "@/components/layout/useLanguageSync";
import { useParams } from "next/navigation";

// Reacts to redux state already hydrated server-side; fetches nothing itself.
export function useClientLayoutLogic() {
  const { lang } = useParams();
  const isRtl = useSelector(getIsRtl);
  const appliedRange = getKmRangeClient();
  const minRange = useSelector(getMinRange);
  const maxRange = useSelector(getMaxRange);
  const token = useSelector(getIsLoggedIn);

  useLanguageSync(lang);

  // Mirror the auth token into a cookie so server-side fetches can forward it.
  useEffect(() => {
    if (token) {
      document.cookie = `token=${token}; path=/; SameSite=Lax; Secure`;
    } else {
      document.cookie = "token=; path=/; max-age=0; Secure";
    }
  }, [token]);

  useEffect(() => {
    if (appliedRange < minRange) saveKilometerRange(minRange);
    else if (appliedRange > maxRange) saveKilometerRange(maxRange);
  }, [minRange, maxRange]);

  // Set direction of the document
  useEffect(() => {
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [isRtl]);
}
