"use client";
import { useTranslation } from "@/lang/useTranslation";
import { getDefaultCountryCode } from "@/lib/format";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { decreaseFollowing, loadUpdateUserData, userSignUpData } from "@/store/slices/authSlice";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { Fcmtoken, getReferralSettings } from "@/store/slices/settingSlice";
import { updateProfileApi, getVerificationStatusApi } from "@/lib/api";
import { toast } from "sonner";
import CustomLink from "@/components/common/CustomLink";
import PhoneInput from "react-phone-input-2";
import { isValidPhoneNumber } from "libphonenumber-js/max";
import { cn } from "@/lib/utils";
import Loader from "@/components/common/Loader";
import FollowersFollowingModal from "@/components/common/FollowersFollowingModal";
import loyaltyCoinImg from '@/public/assets/loyalty-coin.png'
import CustomImage from "@/components/common/CustomImage";
import UserAvatar from "@/components/common/UserAvatar";
import { CameraPlusIcon, CircleNotchIcon, ShieldCheckIcon, StorefrontIcon } from "@phosphor-icons/react";
import StoreSetupModal from "@/features/stores/StoreSetupModal";

const Profile = () => {
  const UserData = useSelector(userSignUpData);
  const IsLoggedIn = UserData !== undefined && UserData !== null;
  const [profileImage, setProfileImage] = useState(UserData?.profile || "");
  const [profileFile, setProfileFile] = useState(null);
  const fetchFCM = useSelector(Fcmtoken);
  // Seeded from redux — AuthActions already fetches get-user-info globally.
  const [formData, setFormData] = useState({
    name: UserData?.name || "",
    email: UserData?.email || "",
    phone: UserData?.mobile || "",
    address: UserData?.address || "",
    notification: UserData?.notification ?? 1,
    show_personal_details: Number(UserData?.show_personal_details) || 0,
    region_code: (
      UserData?.region_code || process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || "in"
    ).toLowerCase(),
    country_code:
      UserData?.country_code?.replace("+", "") || getDefaultCountryCode(),
  });
  const [errors, setErrors] = useState({ name: "", email: "", address: "", phone: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [VerificationStatus, setVerificationStatus] = useState("");
  const [RejectionReason, setRejectionReason] = useState("");
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState("followers");
  const [showStoreModal, setShowStoreModal] = useState(false);
  const { refer_earn_enabled } = useSelector(getReferralSettings);
  const { t } = useTranslation();


  const getVerificationProgress = async () => {
    try {
      setIsPending(true);
      const res = await getVerificationStatusApi.getVerificationStatus();
      if (res?.data?.error === true) {
        setVerificationStatus("not applied");
      } else {
        setVerificationStatus(res?.data?.data?.status);
        setRejectionReason(res?.data?.data?.rejection_reason);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (IsLoggedIn) getVerificationProgress();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handlePhoneChange = (value, data) => {
    const dial = data?.dialCode || "";
    const iso2 = data?.countryCode || "";
    setFormData((prev) => {
      // Deleting into the dial code leaves nothing after it; "" avoids the dial re-prepending.
      const pureMobile = value.startsWith(dial) ? value.slice(dial.length) : "";
      return { ...prev, phone: pureMobile, country_code: dial, region_code: iso2 };
    });
    setErrors((prev) => ({ ...prev, phone: "" }));
  };

  const handleSwitchChange = (id) => {
    setFormData((prevData) => ({
      ...prevData,
      [id]: prevData[id] === 1 ? 0 : 1,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = { name: "", email: "", address: "", phone: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = t("nameRequired");
      isValid = false;
    }
    const mobileNumber = formData.phone || "";
    if (Boolean(mobileNumber) && !isValidPhoneNumber(`+${formData.country_code}${mobileNumber}`)) {
      newErrors.phone = t("invalidPhoneNumber");
      isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = t("emailRequired");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("invalidEmail");
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    try {
      setIsLoading(true);
      const response = await updateProfileApi.updateProfile({
        name: formData.name,
        email: formData.email,
        mobile: mobileNumber,
        address: formData.address,
        profile: profileFile,
        fcm_id: fetchFCM ? fetchFCM : "",
        notification: formData.notification,
        country_code: formData.country_code,
        show_personal_details: formData?.show_personal_details,
        region_code: formData.region_code.toUpperCase(),
      });

      const data = response.data;
      if (data.error !== true) {
        const currentFcmId = UserData?.fcm_id;
        if (!data?.data?.fcm_id && currentFcmId) {
          const updatedData = { ...data?.data, fcm_id: currentFcmId };
          loadUpdateUserData(updatedData);
        } else {
          loadUpdateUserData(data?.data);
        }
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  if (isPending) {
    return (
      <Loader className="flex justify-center items-center h-full" />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col md:flex-row md:items-center sm:justify-between gap-4 md:border md:p-4 md:rounded">
          <div className="flex flex-col md:flex-row items-center gap-4 flex-1">
            <div className="relative">
              <UserAvatar
                src={profileImage}
                initial={UserData?.initial}
                avatarColor={UserData?.avatar_color}
                alt="User profile"
                size={120}
                loading="eager"
                className="w-30 h-30 border-muted border-4"
              />

              <div className="flex items-center justify-center p-1 absolute size-10 rounded-full top-20 right-0 bg-primary border-4 border-[#efefef] text-white cursor-pointer">
                <input
                  type="file"
                  id="profileImageUpload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <label htmlFor="profileImageUpload" className="cursor-pointer">
                  <CameraPlusIcon size={22} />
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <h1
                className="text-xl text-center md:ltr:text-left md:rtl:text-right font-medium wrap-break-word line-clamp-2"
                title={UserData?.name}
              >
                {UserData?.name}
              </h1>
              <p className="break-all text-center md:ltr:text-left md:rtl:text-right">
                {UserData?.email}
              </p>
            </div>
          </div>
          <div className="md:max-w-[50%] flex justify-center md:justify-end">
            {(() => {
              switch (VerificationStatus) {
                case "approved":
                  return (
                    <div className="flex items-center gap-1 rounded text-white bg-[#fa6e53] py-1 px-2 text-sm">
                      <ShieldCheckIcon size={16} weight="fill" />
                      <span>{t("verified")}</span>
                    </div>
                  );

                case "not applied":
                  return (
                    <div className="flex justify-end">
                      <CustomLink
                        href="/user-verification"
                        className={buttonVariants()}
                      >
                        {t("verfiyNow")}
                      </CustomLink>
                    </div>
                  );
                case "pending":
                case "resubmitted":
                  return (
                    <Button type="button" className="cursor-auto">
                      {t("inReview")}
                    </Button>
                  );
                default:
                  return null;
              }
            })()}
          </div>
        </div>
        <div className="flex flex-row md:flex-col justify-around md:justify-center gap-4 bg-white border p-4 rounded-md md:min-w-50">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span>
              {t("followers")}
            </span>
            <button
              type="button"
              className="text-xl font-medium hover:underline"
              onClick={() => {
                setModalInitialTab("followers");
                setShowFollowersModal(true);
              }}
            >
              {UserData?.followers_count || 0}
            </button>
          </div>
          <div className="w-px md:w-full h-auto md:h-px bg-border" />
          <div className="flex flex-col items-center md:items-start gap-1">
            <span>
              {t("following")}
            </span>
            <button
              type="button"
              className="text-xl font-medium hover:underline"
              onClick={() => {
                setModalInitialTab("following");
                setShowFollowersModal(true);
              }}
            >
              {UserData?.following_count || 0}
            </button>
          </div>
        </div>
      </div>
      {showFollowersModal && <FollowersFollowingModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        initialTab={modalInitialTab}
        followersCount={UserData?.followers_count}
        followingCount={UserData?.following_count}
        userId={UserData?.id}
        updateFollowingCount={() => decreaseFollowing()}
        isSellerPage={false}
      />}
      {VerificationStatus === "rejected" && (
        <div className="md:p-4 md:bg-[#fff5f5] md:border md:border-[#feb2b2] md:rounded-md flex flex-col gap-3">
          <h2 className="text-lg font-semibold">
            {t("applicationRejectionReason")}
          </h2>
          <p className="text-sm leading-relaxed">
            {RejectionReason}
          </p>
          <CustomLink
            href="/user-verification"
            className={buttonVariants() + " w-fit px-4 py-2 text-sm"}
          >
            {t("applyAgain")}
          </CustomLink>
        </div>
      )}

      {/* Loyalty Points */}
      {refer_earn_enabled && <CustomLink href="/profile/loyalty-coins" className="p-3 sm:p-4 bg-muted rounded-xl border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center size-13 sm:size-14 bg-white rounded-xl">
            <CustomImage src={loyaltyCoinImg} width={32} height={32} className="size-7 sm:size-8" />
          </div>
          <div>
            <p className="text-muted-foreground text-lg sm:text-xl font-medium">{t("loyaltyCoins")}</p>
            <p className="text-2xl sm:text-[28px] font-medium">{UserData?.loyalty_points || 0}</p>
          </div>
        </div>
        <div className="bg-black rounded p-1 sm:p-2">
          {/* <MdChevronRight className="size-5 sm:size-6 rtl:scale-x-[-1] text-white" /> */}
        </div>
      </CustomLink>}


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:border md:p-4 md:rounded">
        <h1 className="col-span-full text-xl font-medium">
          {t("personalInfo")}
        </h1>

        <div className="labelInputCont">
          <Label htmlFor="name" className="requiredInputLabel">
            {t("name")}
          </Label>
          <Input
            type="text"
            id="name"
            placeholder={t("enterName")}
            value={formData.name}
            onChange={handleChange}
            className={cn(errors.name && "border-destructive focus-visible:ring-destructive")}
          />
          {errors.name && <span className="text-destructive text-sm">{errors.name}</span>}
        </div>

        <div className="flex flex-colgap-1">
          <div className="w-1/2 flex flex-col gap-3">
            <Label className="font-semibold" htmlFor="notification-mode">
              {t("notification")}
            </Label>
            <Switch
              className="rtl:[direction:rtl]"
              id="notification-mode"
              checked={Number(formData.notification) === 1}
              onCheckedChange={() => handleSwitchChange("notification")}
            />
          </div>
          <div className="w-1/2 flex flex-col gap-3">
            <Label className="font-semibold" htmlFor="showPersonal-mode">
              {t("showContactInfo")}
            </Label>
            <Switch
              id="showPersonal-mode"
              checked={Number(formData.show_personal_details) === 1}
              onCheckedChange={() =>
                handleSwitchChange("show_personal_details")
              }
            />
          </div>
        </div>

        <div className="labelInputCont">
          <Label htmlFor="email" className="requiredInputLabel">
            {t("email")}
          </Label>
          <Input
            type="text"
            id="email"
            placeholder={t("enterEmail")}
            value={formData.email}
            onChange={handleChange}
            readOnly={UserData?.type === "email" || UserData?.type === "google"}
            className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
          />
          {errors.email && <span className="text-destructive text-sm">{errors.email}</span>}
        </div>
        <div className="labelInputCont">
          <Label htmlFor="phone" className="font-semibold">
            {t("phoneNumber")}
          </Label>
          <PhoneInput
            country={process.env.NEXT_PUBLIC_DEFAULT_COUNTRY}
            value={`${formData.country_code}${formData.phone}`}
            enableLongNumbers
            onChange={(phone, data) => handlePhoneChange(phone, data)}
            inputProps={{ name: "phone" }}
            containerClass={cn("border border-border rounded-md focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary", errors.phone && "border-destructive focus-within:ring-destructive")}
            inputClass="!border-0 !h-10 !w-full !bg-transparent !outline-none !shadow-none"
            buttonClass={cn("!border-0 !border-r !bg-transparent", errors.phone && "!border-r-destructive")}
            disabled={UserData?.type === "phone"}
          />
          {errors.phone && <span className="text-destructive text-sm">{errors.phone}</span>}
        </div>
      </div>
      <div className="md:border md:p-4 md:rounded">
        <h1 className="col-span-full mb-6 text-xl font-medium">
          {t("address")}
        </h1>
        <div className="labelInputCont">
          <Label htmlFor="address" className="font-semibold">
            {t("address")}
          </Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={cn(errors.address && "border-destructive focus-visible:ring-destructive")}
          />
          {errors.address && <span className="text-destructive text-sm">{errors.address}</span>}
        </div>
      </div>

      {/* Store / Shop Management CTA Card */}
      <div className="md:border md:p-5 md:rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-muted/40 border-dashed border-primary/40">
        <div className="flex items-center gap-3.5">
          <div className="rounded-xl bg-primary/10 p-3 text-primary shrink-0">
            <StorefrontIcon className="h-6 w-6" weight="fill" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {UserData?.has_store ? (t("manageStore") || "Manage Store / Shop") : (t("wantToSetupStore") || "Want to setup Store / Shop?")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {UserData?.has_store
                ? (t("manageStoreDesc") || "Update your business profile, shop address, cover banner, and operating hours.")
                : (t("setupStoreDesc") || "Create your dedicated shop branding, add store location, working hours, and get verified.")}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowStoreModal(true)}
          className="shrink-0 gap-1.5 border-primary text-primary hover:bg-primary hover:text-white"
        >
          <StorefrontIcon className="h-4 w-4" />
          {UserData?.has_store ? (t("editStore") || "Edit Store Setup") : (t("setupStoreCta") || "Setup Store Now")}
        </Button>
      </div>

      <Button disabled={isLoading} className="ltr:ml-auto rtl:mr-auto w-fit">
        {isLoading ?
          <>
            <CircleNotchIcon className="size-4! animate-spin" weight="bold" />
            {t("savingChanges")}
          </>
          :
          t("saveChanges")}
      </Button>

      {/* Store Setup Modal */}
      <StoreSetupModal
        isOpen={showStoreModal}
        onClose={() => setShowStoreModal(false)}
        onSuccess={() => {
          getUserDetails();
        }}
      />
    </form>
  );
};

export default Profile;
