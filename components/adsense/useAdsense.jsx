import { getAdsenseSettings } from "@/store/slices/settingSlice";
import { useSelector } from "react-redux";

export function useAdsense() {
    return useSelector(getAdsenseSettings);
}