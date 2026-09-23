"use client";
import { useParams } from "next/navigation";
import { useRouter } from "@bprogress/next/app";
import { useSelector } from "react-redux";
import { getDefaultLanguageCode } from "@/store/slices/settingSlice";

export const useNavigate = () => {
  const router = useRouter();
  const { lang } = useParams();
  const defaultLangCode = useSelector(getDefaultLanguageCode);

  const navigate = (path = "", options = {}) => {
    const finalPath = path.startsWith("/") ? path : `/${path}`;
    const href = lang === defaultLangCode ? finalPath : `/${lang}${finalPath}`;
    router.push(href, options);
  };

  const pushState = (path = "") => {
    const finalPath = path.startsWith("/") ? path : `/${path}`;
    const href = lang === defaultLangCode ? finalPath : `/${lang}${finalPath}`;
    window.history.pushState(null, "", href);
  };

  const replaceState = (path = "") => {
    const finalPath = path.startsWith("/") ? path : `/${path}`;
    const href = lang === defaultLangCode ? finalPath : `/${lang}${finalPath}`;
    window.history.replaceState(null, "", href);
  };

  return { navigate, pushState, replaceState };
};
