import { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { isValidPhoneNumber } from "libphonenumber-js/max";
import { toast } from "sonner";
import { useTranslation } from "@/lang/useTranslation";
import { handleFirebaseAuthError } from "@/lib/form";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { getOtpApi, getUserExistsApi } from "@/lib/api";
import { useSelector } from "react-redux";
import {
  getOtpServiceProvider,
} from "@/store/slices/settingSlice";
import useAutoFocus from "@/features/auth/hooks/useAutoFocus";
import OtpScreen from "@/features/auth/OtpScreen";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CircleNotchIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import TermsAndPrivacyLinks from "@/features/auth/TermsAndPrivacyLinks";

const RegisterWithMobileForm = ({
  OnHide,
  setDescriptionState,
  isOTPScreen,
  setIsOTPScreen,
  showLoader,
  setShowLoader
}) => {
  const { t } = useTranslation();
  const auth = getAuth();
  const otp_service_provider = useSelector(getOtpServiceProvider);
  const phoneInputRef = useAutoFocus();

  // Mobile registration states
  const [number, setNumber] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ phone: "", password: "", consent: "" });
  const [consentChecked, setConsentChecked] = useState(false);

  // Remove any non-digit characters from the country code
  const countryCodeDigitsOnly = countryCode.replace(/\D/g, "");

  // Check if the entered number starts with the selected country code
  const startsWithCountryCode = number.startsWith(countryCodeDigitsOnly);

  // If the number starts with the country code, remove it
  const formattedNumber = startsWithCountryCode
    ? number.substring(countryCodeDigitsOnly.length)
    : number;

  // Generate reCAPTCHA verifier
  const generateRecaptcha = async () => {
    // Reuse existing verifier if it's still valid
    if (window.recaptchaVerifier && !window.recaptchaVerifier.destroyed) {
      return window.recaptchaVerifier;
    }
    const recaptchaContainer = document.getElementById("recaptcha-container");
    if (!recaptchaContainer) {
      console.error("Container element 'recaptcha-container' not found.");
      return null;
    }
    // Clear container and reset reference
    recaptchaContainer.innerHTML = "";
    window.recaptchaVerifier = undefined;
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        recaptchaContainer,
        { size: "invisible" }
      );
      return window.recaptchaVerifier;
    } catch (error) {
      console.error("Error initializing RecaptchaVerifier:", error.message);
      return null;
    }
  };

  useEffect(() => {
    return () => {
      recaptchaClear();
    };
  }, []);

  const recaptchaClear = async () => {
    if (window.recaptchaVerifier && !window.recaptchaVerifier.destroyed) {
      try {
        await window.recaptchaVerifier.clear();
      } catch (error) {
        // Ignore errors - verifier might already be cleared
      }
    }
    window.recaptchaVerifier = undefined;
    const recaptchaContainer = document.getElementById("recaptcha-container");
    if (recaptchaContainer) {
      recaptchaContainer.innerHTML = "";
    }
  };

  // Send OTP with Twilio
  const sendOtpWithTwillio = async (PhoneNumber) => {
    try {
      const response = await getOtpApi.getOtp({
        number: formattedNumber,
        country_code: countryCode,
      });
      if (response?.data?.error === false) {
        toast.success(t("otpSentSuccess"));
        setIsOTPScreen(true);
        setResendTimer(60);
        setDescriptionState({
          type: "otp",
          phoneNumber: PhoneNumber,
        });
      } else {
        toast.error(t("failedToSendOtp"));
      }
    } catch (error) {
      console.error("error", error);
    } finally {
      setShowLoader(false);
    }
  };

  // Send OTP with Firebase
  const sendOtpWithFirebase = async (PhoneNumber) => {
    try {
      const appVerifier = await generateRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        PhoneNumber,
        appVerifier
      );
      setConfirmationResult(confirmation);
      toast.success(t("otpSentSuccess"));
      setIsOTPScreen(true);
      setResendTimer(60);
      setDescriptionState({
        type: "otp",
        phoneNumber: PhoneNumber,
      });
    } catch (error) {
      console.log(error);
      const errorCode = error.code;
      handleFirebaseAuthError(errorCode, t);
    } finally {
      setShowLoader(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { phone: "", password: "", consent: "" };

    if (!formattedNumber) {
      newErrors.phone = t("pleaseEnterMobileNumber");
      isValid = false;
    } else if (!isValidPhoneNumber(`${countryCode}${formattedNumber}`)) {
      newErrors.phone = t("invalidPhoneNumber");
      isValid = false;
    }

    if (!password) {
      newErrors.password = t("passwordRequired");
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = t("passwordTooShort");
      isValid = false;
    }

    if (!consentChecked) {
      newErrors.consent = t("consentRequired");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle phone input change
  const handleInputChange = (value, data) => {
    setNumber(value);
    setCountryCode("+" + (data?.dialCode || ""));
    setRegionCode(data?.countryCode.toLowerCase() || "");
    setErrors((prev) => ({ ...prev, phone: "" }));
  };

  // Handle country change
  const handleCountryChange = (code) => {
    setCountryCode(code);
  };

  const handleConsentChange = (checked) => {
    setConsentChecked(checked);
    if (checked) setErrors((prev) => ({ ...prev, consent: "" }));
  };

  const checkIfUserExistsOrNot = async () => {
    try {
      const res = await getUserExistsApi.getUserExists({
        mobile: formattedNumber,
        country_code: countryCode,
      });
      if (res?.data?.error === false) {
        toast.error(res?.data?.message);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  // Handle form submission
  const handleMobileSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const PhoneNumber = `${countryCode}${formattedNumber}`;
    setShowLoader(true);
    const isUserExists = await checkIfUserExistsOrNot();

    if (isUserExists) {
      setShowLoader(false);
      return;
    }
    if (otp_service_provider === "twilio" || otp_service_provider === "2factor") {
      await sendOtpWithTwillio(PhoneNumber);
    } else {
      await sendOtpWithFirebase(PhoneNumber);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  // Show OTP screen if OTP was sent
  if (isOTPScreen) {
    return (
      <OtpScreen
        OnHide={OnHide}
        generateRecaptcha={generateRecaptcha}
        countryCode={countryCode}
        formattedNumber={formattedNumber}
        confirmationResult={confirmationResult}
        setConfirmationResult={setConfirmationResult}
        setResendTimer={setResendTimer}
        resendTimer={resendTimer}
        regionCode={regionCode}
        password={password}
        isRegister={true}
        key="register-otp"
      />
    );
  }

  // Show mobile registration form
  return (
    <form className="flex flex-col gap-6" onSubmit={handleMobileSubmit}>
      <div className="labelInputCont">
        <Label className="requiredInputLabel">{t("phoneNumber")}</Label>
        <PhoneInput
          country={process.env.NEXT_PUBLIC_DEFAULT_COUNTRY}
          value={number}
          onChange={(phone, data) => handleInputChange(phone, data)}
          onCountryChange={handleCountryChange}
          inputProps={{
            name: "phone",
            ref: phoneInputRef,
          }}
          containerClass={cn("border border-border rounded-md focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary", errors.phone && "border-destructive focus-within:ring-destructive")}
          inputClass="!border-0 !h-10 !w-full !bg-transparent !outline-none !shadow-none"
          buttonClass={cn("!border-0 !border-r !bg-transparent", errors.phone && "!border-r-destructive")}
          enableLongNumbers
        />
        {errors.phone && (
          <span className="text-destructive text-sm">{errors.phone}</span>
        )}
      </div>

      {/* Password Input */}
      <div className="labelInputCont">
        <Label className="requiredInputLabel">{t("password")}</Label>
        <div className="flex items-center relative">
          <Input
            type={isPasswordVisible ? "text" : "password"}
            placeholder={t("enterPassword")}
            className={cn("ltr:pr-9 rtl:pl-9", errors.password && "border-destructive focus-visible:ring-destructive")}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: "" }));
            }}
          />
          <button
            type="button"
            className="absolute ltr:right-3 rtl:left-3 cursor-pointer"
            onClick={togglePasswordVisibility}
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
      </div>

      <TermsAndPrivacyLinks
        OnHide={OnHide}
        consentChecked={consentChecked}
        setConsentChecked={handleConsentChange}
        error={errors.consent}
      />

      <Button
        type="submit"
        disabled={showLoader || !consentChecked}
        className="text-xl text-white font-light px-4 py-2"
        size="big"
      >
        {showLoader ? (
          <CircleNotchIcon className="size-6! animate-spin" weight="bold" />
        ) : (
          t("continue")
        )}
      </Button>
    </form>
  );
};

export default RegisterWithMobileForm;
