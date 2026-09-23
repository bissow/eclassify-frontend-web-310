import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useAutoFocus from "@/features/auth/hooks/useAutoFocus";
import { toast } from "sonner";
import { useTranslation } from "@/lang/useTranslation";
import { handleFirebaseAuthError } from "@/lib/form";
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { userSignUpApi } from "@/lib/api";
import { useSelector } from "react-redux";
import { Fcmtoken } from "@/store/slices/settingSlice";
import { loadUpdateData } from "@/store/slices/authSlice";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CircleNotchIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

const LoginWithEmailForm = ({ OnHide, forgotPasswordLoading, setForgotPasswordLoading, showLoader, setShowLoader, isLoadingWithGoogle }) => {
  const { t } = useTranslation();
  const emailRef = useAutoFocus();
  const auth = getAuth();
  const fetchFCM = useSelector(Fcmtoken);
  const [loginStates, setLoginStates] = useState({
    email: "",
    password: "",
    IsPasswordVisible: false,
  });
  const [errors, setErrors] = useState({ email: "", password: "" });

  const { email, password, IsPasswordVisible } = loginStates;

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    if (!email.trim()) {
      newErrors.email = t("emailRequired");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("emailInvalid");
      isValid = false;
    }

    if (!password) {
      newErrors.password = t("passwordRequired");
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = t("passwordTooShort");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const signin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential?.user) {
        toast.error(t("userNotFound"));
        return null;
      }
      return userCredential;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const Signin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setShowLoader(true);
      const userCredential = await signin(email, password);
      const user = userCredential.user;
      if (user.emailVerified) {
        try {
          const response = await userSignUpApi.userSignup({
            name: user?.displayName || "",
            email: user?.email,
            firebase_id: user?.uid,
            fcm_id: fetchFCM ? fetchFCM : "",
            type: "email",
            is_login: 1,
          });
          const data = response.data;
          if (data.error === false) {
            loadUpdateData(data);
            toast.success(data.message);
            OnHide();
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      } else {
        toast.error(t("verifyEmailFirst"));
      }
    } catch (error) {
      const errorCode = error.code;
      console.log("Error code:", errorCode);
      handleFirebaseAuthError(errorCode, t);
    } finally {
      setShowLoader(false);
    }
  };

  const handleForgotModal = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: t("emailRequired") }));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors((prev) => ({ ...prev, email: t("emailInvalid") }));
      return;
    }

    try {
      setForgotPasswordLoading(true);
      await sendPasswordResetEmail(auth, email);
      toast.success(t("resetPassword"));
    } catch (error) {
      console.log("error", error);
      handleFirebaseAuthError(error?.code, t);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <>
      <form className="flex flex-col gap-6" onSubmit={Signin}>
        <div className="labelInputCont">
          <Label className="requiredInputLabel">{t("email")}</Label>
          <Input
            type="text"
            placeholder={t("enterEmail")}
            value={email}
            onChange={(e) => {
              setLoginStates((prev) => ({ ...prev, email: e.target.value }));
              setErrors((prev) => ({ ...prev, email: "" }));
            }}
            ref={emailRef}
            className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
          />
          {errors.email && (
            <span className="text-destructive text-sm">{errors.email}</span>
          )}
        </div>
        <div className="labelInputCont">
          <Label className="requiredInputLabel">{t("password")}</Label>
          <div className="flex items-center relative">
            <Input
              type={IsPasswordVisible ? "text" : "password"}
              placeholder={t("enterPassword")}
              className={cn("ltr:pr-9 rtl:pl-9", errors.password && "border-destructive focus-visible:ring-destructive")}
              value={password}
              onChange={(e) => {
                setLoginStates((prev) => ({ ...prev, password: e.target.value }));
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
            />
            <button
              type="button"
              className="absolute ltr:right-3 rtl:left-3 cursor-pointer"
              onClick={() =>
                setLoginStates((prev) => ({
                  ...prev,
                  IsPasswordVisible: !prev.IsPasswordVisible,
                }))
              }
            >
              {IsPasswordVisible ? (
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
            onClick={handleForgotModal}
            type="button"
            disabled={forgotPasswordLoading || showLoader || isLoadingWithGoogle}
          >
            {forgotPasswordLoading ? (
              <span className="flex items-center gap-2 justify-end">
                <CircleNotchIcon className="size-4 animate-spin" weight="bold" />
                <span>{t("loading")}</span>
              </span>
            ) : (
              t("forgtPassword")
            )}
          </button>
        </div>
        <Button
          className="text-xl text-white font-light px-4 py-2"
          size="big"
          disabled={showLoader || forgotPasswordLoading || isLoadingWithGoogle}
        >
          {showLoader ? (
            <CircleNotchIcon className="size-6! animate-spin" weight="bold" />
          ) : (
            t("signIn")
          )}
        </Button>
      </form>
    </>
  );
};

export default LoginWithEmailForm;
