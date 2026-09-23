"use client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTranslation } from "@/lang/useTranslation";
import { useState } from "react";
import LanguageDropdown from "@/components/common/LanguageDropdown";
import { setIsLoginOpen } from "@/store/slices/globalStateSlice";
import CustomImage from "@/components/common/CustomImage";
import { CircleNotchIcon, ListIcon, MapPinIcon, PlusCircleIcon, BellIcon, ChatsIcon, CurrencyCircleDollarIcon, ShoppingBagOpenIcon, HeartIcon, ReceiptIcon, StarIcon, BriefcaseIcon, SignOutIcon, TrashSimpleIcon } from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import { userSignUpData, getUnreadChatCounts } from "@/store/slices/authSlice";
import CustomLink from "@/components/common/CustomLink";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { settingsData } from "@/store/slices/settingSlice";
import FilterTree from "@/features/filter/FilterTree";

const HomeMobileMenu = ({
  setIsLocationModalOpen,
  setIsRegisterModalOpen,
  setIsLogout,
  locationText,
  handleAdListing,
  IsAdListingClicked,
  setManageDeleteAccount,
}) => {
  const { t } = useTranslation();
  const UserData = useSelector(userSignUpData);
  const settings = useSelector(settingsData);
  const { selling, buying } = useSelector(getUnreadChatCounts);
  const unreadChatCount = selling + buying;

  const [isOpen, setIsOpen] = useState(false);

  const showMenu = !!UserData;

  const openLocationEditModal = () => {
    setIsOpen(false);
    setIsLocationModalOpen(true);
  };

  const handleLogin = () => {
    setIsOpen(false);
    setIsLoginOpen(true);
  };

  const handleRegister = () => {
    setIsOpen(false);
    setIsRegisterModalOpen(true);
  };

  const handleSignOut = () => {
    setIsOpen(false);
    setIsLogout(true);
  };

  const handleDeleteAccount = () => {
    setIsOpen(false);
    setManageDeleteAccount((prev) => ({
      ...prev,
      IsDeleteAccount: true,
    }));
  };

  // All user links
  const navItems = (
    <div className="flex flex-col px-4 pb-4">
      <CustomLink
        href="/notifications"
        className="flex items-center gap-1 py-4"
        onClick={() => setIsOpen(false)}
      >
        <BellIcon size={24} weight="bold" />
        <span>{t("notifications")}</span>
      </CustomLink>
      <CustomLink
        href="/chat"
        className="flex items-center gap-1 py-4"
        onClick={() => setIsOpen(false)}
      >
        <ChatsIcon size={24} weight="bold" />
        <span>{t("chat")}</span>
        {unreadChatCount > 0 && (
          <span className="flex items-center justify-center bg-primary text-white rounded-full min-w-5 h-5 px-1 text-xs">
            {unreadChatCount}
          </span>
        )}
      </CustomLink>
      <CustomLink
        href="/user-subscription"
        className="flex items-center gap-1 py-4"
        onClick={() => setIsOpen(false)}
      >
        <CurrencyCircleDollarIcon size={24} weight="bold" />
        <span>{t("subscription")}</span>
      </CustomLink>
      <CustomLink
        href="/my-ads"
        className="flex items-center gap-1 py-4"
        onClick={() => setIsOpen(false)}
      >
        <ShoppingBagOpenIcon size={24} weight="bold" />
        <span>{t("myAds")}</span>
      </CustomLink>
      <CustomLink
        href="/favorites"
        className="flex items-center gap-1 py-4"
        onClick={() => setIsOpen(false)}
      >
        <HeartIcon size={24} weight="bold" />
        <span>{t("favorites")}</span>
      </CustomLink>
      <CustomLink
        href="/transactions"
        className="flex items-center gap-1 py-4"
        onClick={() => setIsOpen(false)}
      >
        <ReceiptIcon size={24} weight="bold" />
        <span>{t("transaction")}</span>
      </CustomLink>
      <CustomLink
        href="/reviews"
        className="flex items-center gap-1 py-4"
        onClick={() => setIsOpen(false)}
      >
        <StarIcon size={24} weight="bold" />
        <span>{t("myReviews")}</span>
      </CustomLink>
      <CustomLink
        href="/job-applications"
        className="flex items-center gap-1 py-4"
        onClick={() => setIsOpen(false)}
      >
        <BriefcaseIcon size={24} weight="bold" />
        <span>{t("jobApplications")}</span>
      </CustomLink>
      <button onClick={handleSignOut} className="flex items-center gap-1 py-4">
        <SignOutIcon size={24} weight="bold" />
        <span>{t("signOut")}</span>
      </button>
      <button
        onClick={handleDeleteAccount}
        className="flex items-center gap-1 text-destructive py-4"
      >
        <TrashSimpleIcon size={24} weight="bold" />
        <span>{t("deleteAccount")}</span>
      </button>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} className="lg:hidden">
      <SheetTrigger asChild className="lg:hidden">
        <button
          id="hamburg"
          className="text-2xl cursor-pointer border rounded-lg p-1"
        >
          <ListIcon size={25} className="text-primary" weight="bold" />
        </button>
      </SheetTrigger>
      <SheetContent className="[&>button:first-child]:hidden] p-0 overflow-y-auto">
        <SheetHeader className="p-4 border-b border">
          <SheetTitle>
            <CustomImage
              src={settings?.header_logo}
              width={195}
              height={92}
              alt="Logo"
              className="w-full h-[39px] sm:h-[52px] object-contain ltr:object-left rtl:object-right max-w-[195px]"
            />
          </SheetTitle>
          <SheetDescription className="sr-only"></SheetDescription>
        </SheetHeader>
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            {UserData ? (
              <CustomLink
                href="/profile"
                className="flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <CustomImage
                  src={UserData?.profile}
                  width={48}
                  height={48}
                  alt={UserData?.name}
                  className="rounded-full size-12 aspect-square object-cover border"
                />
                <p className="line-clamp-2" title={UserData?.name}>
                  {UserData?.name}
                </p>
              </CustomLink>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={handleLogin}>{t("login")}</button>
                <span className="border-l h-6 self-center"></span>
                <button onClick={handleRegister}>{t("register")}</button>
              </div>
            )}
            <div className="shrink-0">
              <LanguageDropdown />
            </div>
          </div>

          <div
            className="flex items-center gap-1 cursor-pointer"
            onClick={openLocationEditModal}
          >
            <MapPinIcon size={16} className="shrink-0" weight="bold" />
            <p
              className="line-clamp-2"
              title={locationText ? locationText : t("addLocation")}
            >
              {locationText ? locationText : t("addLocation")}
            </p>
          </div>

          <button
            className="flex items-center justify-center gap-2 bg-primary py-2 px-3 text-white rounded-md"
            disabled={IsAdListingClicked}
            onClick={() => {
              setIsOpen(false);
              handleAdListing();
            }}
          >
            {IsAdListingClicked ? (
              <CircleNotchIcon size={18} className="animate-spin" weight="bold" />
            ) : (
              <PlusCircleIcon size={18} weight="bold" />
            )}
            <span>{t("adListing")}</span>
          </button>
        </div>

        {showMenu ? (
          <Tabs defaultValue="menu">
            <TabsList className="flex items-center justify-between bg-muted rounded-none">
              <TabsTrigger
                value="menu"
                className="flex-1 data-state-active:bg-primary"
              >
                {t("menu")}
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="flex-1 data-state-active:bg-primary"
              >
                {t("multipleCategories")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="menu">
              {navItems}
            </TabsContent>

            <TabsContent value="categories" className="mt-4 px-4 pb-4">
              <FilterTree onCategorySelect={() => setIsOpen(false)} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="px-4 pb-4 flex flex-col gap-4">
            <h1 className="font-medium">{t("multipleCategories")}</h1>
            <FilterTree onCategorySelect={() => setIsOpen(false)} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default HomeMobileMenu;
