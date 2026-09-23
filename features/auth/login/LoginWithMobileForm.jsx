import PhoneInput from "react-phone-input-2";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import useAutoFocus from "@/features/auth/hooks/useAutoFocus";
import { isValidPhoneNumber } from "libphonenumber-js/max";
import { toast } from "sonner";
import { useTranslation } from "@/lang/useTranslation";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { getUserExistsApi, userSignUpApi } from "@/lib/api";
import { Fcmtoken } from "@/store/slices/settingSlice";
import { useSelector } from "react-redux";
import { loadUpdateData } from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";
import { CircleNotchIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

const LoginWithMobileForm = ({
  loginStates,
  setLoginStates,
  formattedNumber,
  onForgotPassword,
  OnHide,
  setForgotPasswordLoading,
  forgotPasswordLoading,
  isLoadingWithGoogle,
  showLoader,
  setShowLoader
}) => {
  const { t } = useTranslation();
  const numberInputRef = useAutoFocus();
  const { number, countryCode } = loginStates;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const fcm_id = useSelector(Fcmtoken);
  const [errors, setErrors] = useState({ phone: "", password: "" });

  const handleInputChange = (value, data) => {
    setLoginStates((prev) => ({
      ...prev,
      number: value,
      countryCode: "+" + (data?.dialCode || ""),
      regionCode: data?.countryCode.toLowerCase() || "",
    }));
    setErrors((prev) => ({ ...prev, phone: "" }));
  };

  const handleCountryChange = (code) => {
    setLoginStates((prev) => ({
      ...prev,
      countryCode: code,
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { phone: "", password: "" };

    if (!formattedNumber) {
      newErrors.phone = t("pleaseEnterMobileNumber");
      isValid = false;
    } else if (!isValidPhoneNumber(`${countryCode}${formattedNumber}`)) {
      newErrors.phone = t("invalidPhoneNumber");
      isValid = false;
    }

    if (!loginStates.password.trim()) {
      newErrors.password = t("passwordRequired");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLoginWithMobile = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setShowLoader(true);
      const params = {
        mobile: formattedNumber,
        password: loginStates.password,
        country_code: countryCode,
        type: "phone",
        fcm_id: fcm_id ? fcm_id : "",
        is_login: 1,
      };
      const response = await userSignUpApi.userSignup(params);
      if (response?.data?.error === false) {
        toast.success(response?.data?.message);
        loadUpdateData(response?.data);
        OnHide();
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setShowLoader(false);
    }
  };

  const checkIfUserExistsOrNot = async () => {
    try {
      const res = await getUserExistsApi.getUserExists({
        mobile: formattedNumber,
        country_code: countryCode,
        forgot_password: 1
      });
      if (res?.data?.error === false) {
        return true;
      } else {
        toast.error(res?.data?.message);
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const handleForgotPasswordClick = async () => {
    if (!formattedNumber) {
      setErrors((prev) => ({ ...prev, phone: t("pleaseEnterMobileNumber") }));
      return;
    }

    if (!isValidPhoneNumber(`${countryCode}${formattedNumber}`)) {
      setErrors((prev) => ({ ...prev, phone: t("invalidPhoneNumber") }));
      return;
    }

    setForgotPasswordLoading(true);
    const isUserExists = await checkIfUserExistsOrNot();
    if (!isUserExists) {
      setForgotPasswordLoading(false);
      return;
    }
    await onForgotPassword();
    setForgotPasswordLoading(false);
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleLoginWithMobile}>
      <div className="labelInputCont">
        <Label className="font-semibold requiredInputLabel">
          {t("mobileNumber")}
        </Label>
        <PhoneInput
          country={process.env.NEXT_PUBLIC_DEFAULT_COUNTRY}
          value={number}
          onChange={(phone, data) => handleInputChange(phone, data)}
          onCountryChange={handleCountryChange}
          inputProps={{
            name: "phone",
            ref: numberInputRef,
          }}
          enableLongNumbers
          containerClass={cn("border border-border rounded-md focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary", errors.phone && "border-destructive focus-within:ring-destructive")}
          inputClass="!border-0 !h-10 !w-full !bg-transparent !outline-none !shadow-none"
          buttonClass={cn("!border-0 !border-r !bg-transparent", errors.phone && "!border-r-destructive")}
        />
        {errors.phone && (
          <span className="text-destructive text-sm">{errors.phone}</span>
        )}
      </div>
      <div className="labelInputCont">
        <Label className="requiredInputLabel">{t("password")}</Label>
        <div className="flex items-center relative">
          <Input
            type={isPasswordVisible ? "text" : "password"}
            placeholder={t("enterPassword")}
            className={cn("ltr:pr-9 rtl:pl-9", errors.password && "border-destructive focus-visible:ring-destructive")}
            value={loginStates.password}
            onChange={(e) => {
              setLoginStates((prev) => ({ ...prev, password: e.target.value }));
              setErrors((prev) => ({ ...prev, password: "" }));
            }}
          />
          <button
            type="button"
            className="absolute ltr:right-3 rtl:left-3 cursor-pointer"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
          >
            {isPasswordVisible ? (
              <EyeIcon size={20} />
            ) : (
              <EyeSlashIcon size={20} />
            )}
          </button>
        </div>
        {errors.password && (
          <span className="text-destructive text-sm">{errors.password}</span>
        )}
        <button
          className="text-right font-semibold text-primary w-fit self-end"
          onClick={handleForgotPasswordClick}
          type="button"
          disabled={forgotPasswordLoading || showLoader || isLoadingWithGoogle}
        >
          {forgotPasswordLoading ? (
            <>
              <span className="flex items-center gap-2 justify-end">
                <CircleNotchIcon className="size-4 animate-spin" weight="bold" />
                <span>{t("loading")}</span>
              </span>
            </>
          ) : (
            t("forgtPassword")
          )}
        </button>
      </div>
      <Button
        type="submit"
        disabled={showLoader || forgotPasswordLoading || isLoadingWithGoogle}
        className="text-xl text-white font-light px-4 py-2"
        size="big"
      >
        {showLoader ? <CircleNotchIcon className="size-6! animate-spin" weight="bold" /> : t("login")}
      </Button>
    </form>
  );
};

export default LoginWithMobileForm;
