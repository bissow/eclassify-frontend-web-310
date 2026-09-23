import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userSignUpData, getUnreadChatCounts } from "@/store/slices/authSlice";
import { useTranslation } from "@/lang/useTranslation";
import { truncate } from "@/lib/utils";
import { useSelector } from "react-redux";
import { useMediaQuery } from "usehooks-ts";
import UserAvatar from "@/components/common/UserAvatar";
import { useNavigate } from "@/hooks/useNavigate";
import { UserIcon, BellIcon, ChatsIcon, CurrencyCircleDollarIcon, ShoppingBagOpenIcon, HeartIcon, ReceiptIcon, StarIcon, BriefcaseIcon, SignOutIcon, CaretDownIcon, HandCoinsIcon, TrendUpIcon } from "@phosphor-icons/react";
import { getReferralSettings } from "@/store/slices/settingSlice";

const ProfileDropdown = ({ IsLogout, setIsLogout }) => {
  const isSmallScreen = useMediaQuery("(max-width: 1200px)");
  const { navigate } = useNavigate();
  const UserData = useSelector(userSignUpData);
  const { refer_earn_enabled } = useSelector(getReferralSettings);
  const { selling, buying } = useSelector(getUnreadChatCounts);
  const unreadChatCount = selling + buying;
  const { t } = useTranslation();
  return (
    <DropdownMenu key={IsLogout}>
      <DropdownMenuTrigger className="flex items-center gap-1">
        <div className="relative">
          <UserAvatar
            src={UserData?.profile}
            initial={UserData?.initial}
            avatarColor={UserData?.avatar_color}
            alt={UserData?.name}
            size={32}
            className="w-8 h-8 border"
          />
          {unreadChatCount > 0 && (
            <span className="size-5 flex items-center justify-center rounded-full bg-primary text-white text-xs absolute -top-2 ltr:-right-1 rtl:-left-1">
              {unreadChatCount}
            </span>
          )}
        </div>
        <p>{truncate(UserData.name, 12)}</p>
        <CaretDownIcon className="text-muted-foreground shrink-0" size={12} weight="bold" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isSmallScreen ? "start" : "center"}>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <UserIcon size={16} weight="bold" />
          <span>{t("myProfile")}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/notifications")}
        >
          <BellIcon size={16} weight="bold" />
          {t("notification")}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/chat")}
        >
          <ChatsIcon size={16} weight="bold" />
          {t("chat")}
          {unreadChatCount > 0 && (
            <span className="flex items-center justify-center bg-primary text-white rounded-full min-w-5 h-5 px-1 text-xs">
              {unreadChatCount}
            </span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/user-subscription")}
        >
          <CurrencyCircleDollarIcon size={16} weight="bold" />
          {t("subscription")}
        </DropdownMenuItem>
        {refer_earn_enabled && <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/refer-and-earn")}
        >
          <HandCoinsIcon size={16} weight="bold" />
          {t("referAndEarn")}
        </DropdownMenuItem>}

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/my-ads")}
        >
          <ShoppingBagOpenIcon size={16} weight="bold" />
          {t("myAds")}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/my-promotions")}
        >
          <TrendUpIcon size={16} weight="bold" />
          {t("promotionsAnalytics")}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/favorites")}
        >
          <HeartIcon size={16} weight="bold" />
          {t("favorites")}
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => navigate("/transactions")}>
          <ReceiptIcon size={16} weight="bold" />
          {t("transaction")}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/reviews")}
        >
          <StarIcon size={16} weight="bold" />
          {t("myReviews")}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => navigate("/job-applications")}
        >
          <BriefcaseIcon size={16} weight="bold" />
          {t("jobApplications")}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setIsLogout(true)}
        >
          <SignOutIcon size={16} weight="bold" />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
