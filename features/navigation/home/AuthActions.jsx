"use client";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { getIsLoggedIn, loadUpdateUserData, getStoredFcmId } from "@/store/slices/authSlice.js";
import { useTranslation } from "@/lang/useTranslation";
import { truncate } from "@/lib/utils";
import { getUserInfoApi } from "@/lib/api";
import ProfileDropdown from "@/features/navigation/home/ProfileDropdown.jsx";

// Client-only (imported with ssr:false). Auth comes from redux-persist, i.e.
// localStorage, which the server cannot see — rendering this branch on the
// server would emit the logged-out markup and mismatch on hydration.
// The whole branch has to be client-only, not just ProfileDropdown: the two
// arms produce different elements, so the mismatch is at the branch itself.
const AuthActions = ({
  IsLogout,
  setIsLogout,
  setIsLoginOpen,
  setIsRegisterModalOpen,
}) => {
  const IsLoggedin = useSelector(getIsLoggedIn);
  const storedFcmId = useSelector(getStoredFcmId);
  const { t } = useTranslation();

  // Fetched here (header mounts globally) so total_seller/buyer_unread_chat_count
  // are available for the chat tabs and profile dropdown badges on any page.
  useEffect(() => {
    if (!IsLoggedin) return;

    const fetchUserInfo = async () => {
      try {
        const res = await getUserInfoApi.getUserInfo();
        if (res?.data?.error === false) {
          const info = res.data.data;
          // Backend returns fcm_id: "" here; keep the token stored at login.
          loadUpdateUserData({ ...info, fcm_id: info?.fcm_id || storedFcmId });
        }
      } catch (error) {
        console.log("Error fetching user info:", error);
      }
    };
    fetchUserInfo();
  }, [IsLoggedin]);

  if (IsLoggedin) {
    return <ProfileDropdown setIsLogout={setIsLogout} IsLogout={IsLogout} />;
  }

  return (
    <>
      <button onClick={() => setIsLoginOpen(true)} title={t("login")}>
        {truncate(t("login"), 12)}
      </button>
      <span className="border-l h-6 self-center"></span>
      <button
        onClick={() => setIsRegisterModalOpen(true)}
        title={t("register")}
      >
        {truncate(t("register"), 12)}
      </button>
    </>
  );
};

export default AuthActions;
