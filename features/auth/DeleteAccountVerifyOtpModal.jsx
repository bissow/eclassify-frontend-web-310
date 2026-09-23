"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import "react-phone-input-2/lib/style.css";
import { useTranslation } from "@/lang/useTranslation";
import { handleFirebaseAuthError } from "@/lib/form";
import { useSelector } from "react-redux";
import { logoutSuccess, userSignUpData } from "@/store/slices/authSlice";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useAutoFocus from "@/features/auth/hooks/useAutoFocus";
import {
  deleteUser,
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { toast } from "sonner";
import { deleteUserApi } from "@/lib/api";
import FirebaseData from "@/lib/firebase";
import { CircleNotchIcon } from "@phosphor-icons/react";

const DeleteAccountVerifyOtpModal = ({
  isOpen,
  setIsOpen,
  pathname,
  navigate,
}) => {
  const { t } = useTranslation();
  const userData = useSelector(userSignUpData);
  const auth = getAuth();
  const { revokeToken } = FirebaseData();

  const countryCode = userData?.country_code;
  const formattedNumber = userData?.mobile;

  const otpInputRef = useAutoFocus();
  const [showLoader, setShowLoader] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendOtpLoader, setResendOtpLoader] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        sendOTP();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    let intervalId;
    if (resendTimer > 0) {
      intervalId = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [resendTimer]);

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

  const sendOTP = async () => {
    try {
      const PhoneNumber = `${countryCode}${formattedNumber}`;
      setShowLoader(true);
      const appVerifier = await generateRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        PhoneNumber,
        appVerifier
      );
      setConfirmationResult(confirmation);
      toast.success(t("otpSentSuccess"));
      setResendTimer(60);
    } catch (error) {
      console.log(error);
      handleFirebaseAuthError(error.code, t);
    } finally {
      setShowLoader(false);
    }
  };

  const verifyOTPWithFirebase = async (e) => {
    e.preventDefault();
    try {
      setShowLoader(true);
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      await deleteUser(user);
      await revokeToken();
      await deleteUserApi.deleteUser();
      logoutSuccess();
      toast.success(t("userDeleteSuccess"));
      setIsOpen(false);
      if (pathname !== "/") {
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      const errorCode = error?.code;
      handleFirebaseAuthError(errorCode, t);
    } finally {
      setShowLoader(false);
    }
  };

  const resendOtp = async () => {
    try {
      setResendOtpLoader(true);
      const PhoneNumber = `${countryCode}${formattedNumber}`;
      const appVerifier = await generateRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        PhoneNumber,
        appVerifier
      );
      setConfirmationResult(confirmation);
      toast.success(t("otpSentSuccess"));
    } catch (error) {
      const errorCode = error.code;
      handleFirebaseAuthError(errorCode, t);
    } finally {
      setResendOtpLoader(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="px-[40px] sm:py-[50px] sm:px-[90px]"
        >
          <DialogHeader>
            <DialogTitle className="text-3xl sm:text-4xl font-light">
              {t("verifyOtp")}
            </DialogTitle>
            <DialogDescription className="text-base text-black font-light">
              {t("sentTo")} {`${countryCode} ${formattedNumber}`}
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-6"
            onSubmit={verifyOTPWithFirebase}
          >
            <div className="labelInputCont">
              <Label className="requiredInputLabel">{t("otp")}</Label>
              <Input
                type="text"
                placeholder={t("enterOtp")}
                id="otp"
                name="otp"
                value={otp}
                maxLength={6}
                onChange={(e) => setOtp(e.target.value)}
                ref={otpInputRef}
              />
            </div>
            <Button
              type="submit"
              disabled={showLoader}
              className="text-xl text-white font-light px-4 py-2"
              size="big"
            >
              {showLoader ? (
                <CircleNotchIcon className="size-6! animate-spin" weight="bold" />
              ) : (
                t("verify")
              )}
            </Button>

            <Button
              type="button"
              className="text-lg text-black font-light bg-transparent hover:bg-transparent!"
              size="big"
              onClick={resendOtp}
              disabled={resendOtpLoader || showLoader || resendTimer > 0}
            >
              {resendOtpLoader ? (
                <CircleNotchIcon className="size-6! animate-spin" weight="bold" />
              ) : resendTimer > 0 ? (
                `${t("resendOtp")} ${resendTimer}s`
              ) : (
                t("resendOtp")
              )}
            </Button>
          </form>
          <div id="recaptcha-container" style={{ display: "none" }}></div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteAccountVerifyOtpModal;
