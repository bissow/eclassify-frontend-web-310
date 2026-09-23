"use client";
import LanguageDropdown from "@/components/common/LanguageDropdown";
import {
  getOtpServiceProvider,
  getHomeScreenSections,
  settingsData,
} from "@/store/slices/settingSlice";
import { truncate } from "@/lib/utils";
import CustomLink from "@/components/common/CustomLink";
import { useSelector } from "react-redux";
import HomeMobileMenu from "@/features/navigation/home/HomeMobileMenu.jsx";
import { useState } from "react";
import { useLiveCityData } from "@/lib/location";
import {
  getIsLoggedIn,
  logoutSuccess,
  userSignUpData,
} from "@/store/slices/authSlice.js";
import { CategoryData } from "@/store/slices/categorySlice";
import { toast } from "sonner";
import FirebaseData from "@/lib/firebase.js";
import dynamic from "next/dynamic";
import {
  getIsLoginModalOpen,
  setIsLoginOpen,
} from "@/store/slices/globalStateSlice.js";
import { deleteUserApi, logoutApi } from "@/lib/api";
import CustomImage from "@/components/common/CustomImage.jsx";
import { CircleNotchIcon, MapPinIcon, PlusCircleIcon } from "@phosphor-icons/react";
import { useNavigate } from "@/hooks/useNavigate.jsx";
import { usePathname } from "next/navigation.js";
import HeaderCategories from "@/features/navigation/home/HeaderCategories.jsx";
import { deleteUser, getAuth } from "firebase/auth";
import Search from "@/features/navigation/home/Search.jsx";
import { useTranslation } from "@/lang/useTranslation";
import { Skeleton } from "@/components/ui/skeleton";

const AuthActions = dynamic(() => import("@/features/navigation/home/AuthActions.jsx"), { ssr: false, loading: () => <Skeleton className="w-32 h-8" /> });
const LoginModal = dynamic(() => import("@/features/auth/login/LoginModal.jsx"), { ssr: false });
const RegisterModal = dynamic(() => import("@/features/auth/register/RegisterModal.jsx"), { ssr: false, });
const LocationModal = dynamic(() => import("@/features/location/LocationModal.jsx"), { ssr: false });
const MailSentSuccessModal = dynamic(() => import("@/features/auth/MailSentSuccessModal.jsx"), { ssr: false });
const ReusableAlertDialog = dynamic(() => import("@/components/common/ReusableAlertDialog"), { ssr: false });
const UnauthorizedModal = dynamic(() => import("@/features/auth/UnauthorizedModal.jsx"), { ssr: false });
const PackageRequiredModal = dynamic(() => import("@/components/common/PackageRequiredModal"), { ssr: false });
const SelectAdTypeModal = dynamic(() => import("@/features/navigation/home/SelectAdTypeModal.jsx"), { ssr: false });
const DeleteAccountVerifyOtpModal = dynamic(() => import("@/features/auth/DeleteAccountVerifyOtpModal.jsx"), { ssr: false });

const HomeHeader = ({ cityData }) => {
  // 📦 Framework & Firebase
  const { navigate } = useNavigate();
  const { signOut } = FirebaseData();
  const pathname = usePathname();
  const { t } = useTranslation();

  // 🔌 Redux State (via useSelector)

  // User & Auth
  const userData = useSelector(userSignUpData);
  const IsLoggedin = useSelector(getIsLoggedIn);
  const IsLoginOpen = useSelector(getIsLoginModalOpen);
  const otp_service_provider = useSelector(getOtpServiceProvider);
  const [googleConsent, setGoogleConsent] = useState({
    isOpen: false,
    checked: false,
    loading: false,
    pendingUser: null,
  });


  // Ads & Categories
  // Seeded server-side into preloadedState (store/providers.jsx), so redux
  // already holds page 1 on first paint — no client fetch, no prop drilling.
  const effectiveCateData = useSelector(CategoryData);

  // Location — hydration-safe reactive read of the location cookie. See
  // useLiveCityData in lib/location.js for how it stays correct across a
  // fresh mount (e.g. landing → home) as well as live edits on this page.
  const liveCityData = useLiveCityData(cityData);

  // Language & Settings
  const settings = useSelector(settingsData);
  const homeScreenSections = useSelector(getHomeScreenSections);
  const showCategories = !homeScreenSections || homeScreenSections.some((s) => s.section_type === "all_categories");

  // 🎛️ Local UI State (via useState)

  // Modals
  const [IsRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [IsLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [IsVerifyOtpBeforeDelete, setIsVerifyOtpBeforeDelete] = useState(false);

  // Auth State
  const [IsLogout, setIsLogout] = useState(false);
  const [IsLoggingOut, setIsLoggingOut] = useState(false);

  // Profile
  const [IsUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Ad Listing
  const [IsAdListingClicked, setIsAdListingClicked] = useState(false);
  const [IsPackageRequired, setIsPackageRequired] = useState(false);
  const [isSelectAdTypeOpen, setIsSelectAdTypeOpen] = useState(false);

  // Email Status
  const [IsMailSentSuccess, setIsMailSentSuccess] = useState(false);

  //delete account state
  const [manageDeleteAccount, setManageDeleteAccount] = useState({
    IsDeleteAccount: false,
    IsDeleting: false,
  });


  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      const res = await logoutApi.logoutApi({
        ...(userData?.fcm_id && { fcm_token: userData?.fcm_id }),
      });
      if (res?.data?.error === false) {
        logoutSuccess();
        toast.success(t("signOutSuccess"));
        setIsLogout(false);
        // avoid redirect if already on home page otherwise router.push triggering server side api calls
        if (pathname !== "/") {
          navigate("/");
        }
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.log("Failed to log out", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAdListing = async () => {
    if (!IsLoggedin) {
      setIsLoginOpen(true);
      return;
    }
    if (!userData?.name || !userData?.email) {
      setIsUpdatingProfile(true);
      return;
    }
    setIsSelectAdTypeOpen(true);
  };

  const handleUpdateProfile = () => {
    setIsUpdatingProfile(false);
    navigate("/profile");
  };

  const locationText =
    liveCityData?.address_translated || liveCityData?.formattedAddress;

  const handleDeleteAcc = async () => {
    try {
      setManageDeleteAccount((prev) => ({ ...prev, IsDeleting: true }));
      const auth = getAuth();
      const user = auth.currentUser;
      const isMobileLogin = userData?.type == "phone";
      const needsOtpVerification = isMobileLogin && !user && otp_service_provider === "firebase";
      if (user) {
        await deleteUser(user);
      } else if (needsOtpVerification) {
        setManageDeleteAccount((prev) => ({ ...prev, IsDeleteAccount: false }));
        setIsVerifyOtpBeforeDelete(true);
        return;
      }
      await deleteUserApi.deleteUser();
      logoutSuccess();
      toast.success(t("userDeleteSuccess"));
      setManageDeleteAccount((prev) => ({ ...prev, IsDeleteAccount: false }));
      // avoid redirect if already on home page otherwise router.push triggering server side api calls
      if (pathname !== "/") {
        navigate("/");
      }
    } catch (error) {
      console.error("Error deleting user:", error.message);
      const isMobileLogin = userData?.type === "phone";
      if (error.code === "auth/requires-recent-login" || error.message?.includes("CREDENTIAL_TOO_OLD_LOGIN_AGAIN")) {
        if (isMobileLogin) {
          setManageDeleteAccount((prev) => ({
            ...prev,
            IsDeleteAccount: false, // close delete modal
          }));
          setIsVerifyOtpBeforeDelete(true); // open OTP screen
          return;
        }
        logoutSuccess();
        toast.error(t("deletePop"));
        setManageDeleteAccount((prev) => ({ ...prev, IsDeleteAccount: false }));
      }
    } finally {
      setManageDeleteAccount((prev) => ({ ...prev, IsDeleting: false }));
    }
  };

  return (
    <>
      <header className="py-5 border-b">
        <nav className="container">
          <div className="space-between">
            <CustomLink
              href="/"
              data-prevent-progress={pathname === "/" ? "true" : undefined}
              onClick={(e) => {
                if (pathname === "/") e.preventDefault();
              }}
            >
              <CustomImage
                src={settings?.header_logo}
                alt="logo"
                width={195}
                height={52}
                loading="eager"
                className="w-full h-9.75 sm:h-13 object-contain ltr:object-left rtl:object-right max-w-48.75"
              />
            </CustomLink>
            {/* desktop category search select */}

            <div className="hidden lg:flex items-center border leading-none rounded">
              <Search />
            </div>

            <button
              className="hidden lg:flex items-center gap-1"
              onClick={() => setIsLocationModalOpen(true)}
            >
              <MapPinIcon
                size={16}
                className="shrink-0"
                title={locationText ? locationText : t("addLocation")} />
              <p
                className="hidden xl:block text-sm"
                title={locationText ? locationText : t("addLocation")}
              >
                {locationText
                  ? truncate(locationText, 12)
                  : truncate(t("addLocation"), 12)}
              </p>
            </button>

            <div className="hidden lg:flex items-center gap-2">
              <AuthActions
                IsLogout={IsLogout}
                setIsLogout={setIsLogout}
                setIsLoginOpen={setIsLoginOpen}
                setIsRegisterModalOpen={setIsRegisterModalOpen}
              />

              <button
                className="bg-primary px-2 xl:px-4 py-2 items-center text-white rounded-md  flex gap-1"
                disabled={IsAdListingClicked}
                onClick={handleAdListing}
                title={t("adListing")}
              >
                {IsAdListingClicked ? (
                  <CircleNotchIcon size={18} className="animate-spin" weight="bold" />
                ) : (
                  <PlusCircleIcon size={18} weight="bold" />
                )}

                <span className="hidden xl:inline">
                  {truncate(t("adListing"), 12)}
                </span>
              </button>

              <LanguageDropdown />
            </div>
            <HomeMobileMenu
              setIsLocationModalOpen={setIsLocationModalOpen}
              setIsRegisterModalOpen={setIsRegisterModalOpen}
              setIsLogout={setIsLogout}
              locationText={locationText}
              handleAdListing={handleAdListing}
              IsAdListingClicked={IsAdListingClicked}
              setManageDeleteAccount={setManageDeleteAccount}
            />
          </div>

          <div className="flex lg:hidden items-center border leading-none rounded mt-2">
            <Search />
          </div>
        </nav>
      </header>
      {showCategories && effectiveCateData.length > 0 && (
        <HeaderCategories cateData={effectiveCateData} cityData={liveCityData} />
      )}
      <LoginModal
        key={IsLoginOpen}
        IsLoginOpen={IsLoginOpen}
        setIsRegisterModalOpen={setIsRegisterModalOpen}
        googleConsent={googleConsent}
        setGoogleConsent={setGoogleConsent}
      />

      <RegisterModal
        setIsMailSentSuccess={setIsMailSentSuccess}
        IsRegisterModalOpen={IsRegisterModalOpen}
        setIsRegisterModalOpen={setIsRegisterModalOpen}
        key={`${IsRegisterModalOpen}-register-modal`}
      />
      <MailSentSuccessModal
        IsMailSentSuccess={IsMailSentSuccess}
        setIsMailSentSuccess={setIsMailSentSuccess}
      />

      {/* Reusable Alert Dialog for Logout */}
      <ReusableAlertDialog
        open={IsLogout}
        onCancel={() => setIsLogout(false)}
        onConfirm={handleLogout}
        title={t("confirmLogout")}
        description={t("areYouSureToLogout")}
        cancelText={t("cancel")}
        confirmText={t("yes")}
        confirmDisabled={IsLoggingOut}
      />

      {/* Reusable Alert Dialog for Updating Profile */}
      <ReusableAlertDialog
        open={IsUpdatingProfile}
        onCancel={() => setIsUpdatingProfile(false)}
        onConfirm={handleUpdateProfile}
        title={t("updateProfile")}
        description={t("youNeedToUpdateProfile")}
        confirmText={t("yes")}
      />

      <ReusableAlertDialog
        open={manageDeleteAccount?.IsDeleteAccount}
        onCancel={() =>
          setManageDeleteAccount((prev) => ({
            ...prev,
            IsDeleteAccount: false,
          }))
        }
        onConfirm={handleDeleteAcc}
        title={t("areYouSure")}
        description={
          <ul className="list-disc list-inside mt-2">
            <li>{t("adsAndTransactionWillBeDeleted")}</li>
            <li>{t("accountsDetailsWillNotRecovered")}</li>
            <li>{t("subWillBeCancelled")}</li>
            <li>{t("savedMesgWillBeLost")}</li>
          </ul>
        }
        cancelText={t("cancel")}
        confirmText={t("yes")}
        confirmDisabled={manageDeleteAccount?.IsDeleting}
      />

      <LocationModal
        key={`${IsLocationModalOpen}-location-modal`}
        IsLocationModalOpen={IsLocationModalOpen}
        setIsLocationModalOpen={setIsLocationModalOpen}
      />
      <UnauthorizedModal />
      <PackageRequiredModal
        open={IsPackageRequired}
        onClose={() => setIsPackageRequired(false)}
      />
      <SelectAdTypeModal
        open={isSelectAdTypeOpen}
        onClose={() => setIsSelectAdTypeOpen(false)}
      />
      <DeleteAccountVerifyOtpModal
        isOpen={IsVerifyOtpBeforeDelete}
        setIsOpen={setIsVerifyOtpBeforeDelete}
        key={`${IsVerifyOtpBeforeDelete}-delete-account-verify-otp-modal`}
        pathname={pathname}
        navigate={navigate}
      />
    </>
  );
};

export default HomeHeader;
