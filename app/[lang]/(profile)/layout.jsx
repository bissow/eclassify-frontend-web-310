"use client";
import ProfileSidebar from "@/features/profile/ProfileSidebar";
import BreadCrumb from "@/components/common/BreadCrumb";
import BlockedUsersMenu from "@/features/chat/list/BlockedUsersMenu";
import Checkauth from "@/features/auth/Checkauth";
import ShareDropdown from "@/components/common/ShareDropdown";
import { cn } from "@/lib/utils";
import { useParams, useSelectedLayoutSegment } from "next/navigation";
import { useSelector } from "react-redux";
import { userSignUpData } from "@/store/slices/authSlice";
import { getCompanyName } from "@/store/slices/settingSlice";
import { useTranslation } from "@/lang/useTranslation";

const segmentLabelMap = {
  profile: "myProfile",
  "my-ads": "myAds",
  transactions: "myTransaction",
  favorites: "myFavorites",
  notifications: "notifications",
  reviews: "reviews",
  chat: "chat",
  "job-applications": "jobApplications",
  "user-subscription": "subscription",
  "refer-and-earn": "referAndEarn",
};

const ProfileLayout = ({ children }) => {
  const { t } = useTranslation();
  const { lang } = useParams();
  const segment = useSelectedLayoutSegment();
  const isChat = segment === "chat";
  const heading = t(segmentLabelMap[segment] || "");

  const userData = useSelector(userSignUpData);
  const companyName = useSelector(getCompanyName);
  const showProfileShare = segment === "profile" && userData?.id;
  const profileShareUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/${lang}/seller/${userData?.id}`;
  const profileShareTitle = `${userData?.name || ""} | ${companyName || ""}`;

  return (
    <>
      <BreadCrumb items={[{ name: heading }]} />
      <div className="container mt-8">
        <div className="flex items-center justify-between">
          <h1 className={cn("sectionTitle", segment === "user-subscription" && "hidden lg:block")}>{heading}</h1>
          {isChat && (
            <div className="xl:hidden">
              <BlockedUsersMenu />
            </div>
          )}
          {showProfileShare && (
            <ShareDropdown
              url={profileShareUrl}
              title={profileShareTitle}
              headline={profileShareTitle}
              companyName={companyName}
              className="rounded-md p-2 border bg-white"
            />
          )}
        </div>

        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-4 lg:border rounded-lg mt-6",
            isChat && "border"
          )}
        >
          <div className="hidden lg:block max-h-fit lg:col-span-1 lg:ltr:border-r lg:rtl:border-l">
            <ProfileSidebar />
          </div>

          <div className={cn("lg:col-span-3 lg:border-t-0", !isChat && "lg:p-7")}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkauth(ProfileLayout);
