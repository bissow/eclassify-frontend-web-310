import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "@/lang/useTranslation";
import { handleFirebaseAuthError } from "@/lib/form";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
} from "firebase/auth";
import { userSignUpApi } from "@/lib/api";
import useAutoFocus from "@/features/auth/hooks/useAutoFocus";
import { cn } from "@/lib/utils";
import { CircleNotchIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import TermsAndPrivacyLinks from "@/features/auth/TermsAndPrivacyLinks";

const RegisterWithEmailForm = ({ OnHide, setIsMailSentSuccess, showLoader, setShowLoader }) => {
  const { t } = useTranslation();
  const auth = getAuth();
  const emailRef = useAutoFocus();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    IsPasswordVisible: false,
  });
  const [errors, setErrors] = useState({ email: "", username: "", password: "", consent: "" });
  const [consentChecked, setConsentChecked] = useState(false);

  const { email, username, password, IsPasswordVisible } = formData;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleConsentChange = (checked) => {
    setConsentChecked(checked);
    if (checked) setErrors((prev) => ({ ...prev, consent: "" }));
  };

  const togglePasswordVisibility = () => {
    setFormData((prev) => ({
      ...prev,
      IsPasswordVisible: !prev.IsPasswordVisible,
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", username: "", password: "", consent: "" };

    if (!email.trim()) {
      newErrors.email = t("emailRequired");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("emailInvalid");
      isValid = false;
    }

    if (!username.trim()) {
      newErrors.username = t("usernameRequired");
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

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setShowLoader(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);

      try {
        await userSignUpApi.userSignup({
          name: username ? username : "",
          email: email ? email : "",
          firebase_id: user?.uid,
          type: "email",
          registration: true,
        });
        OnHide();
        setIsMailSentSuccess(true);
      } catch (error) {
        console.log("error", error);
        toast.error(t("registrationFailed"));
      }
    } catch (error) {
      const errorCode = error.code;
      console.log(error);
      handleFirebaseAuthError(errorCode, t);
    } finally {
      setShowLoader(false);
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSignup}>
      <div className="labelInputCont">
        <Label className="requiredInputLabel">{t("email")}</Label>
        <Input
          type="text"
          placeholder={t("enterEmail")}
          value={email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          ref={emailRef}
          className={cn(errors.email && "border-destructive focus-visible:ring-destructive")}
        />
        {errors.email && (
          <span className="text-destructive text-sm">{errors.email}</span>
        )}
      </div>

      <div className="labelInputCont">
        <Label className="requiredInputLabel">{t("username")}</Label>
        <Input
          type="text"
          placeholder={t("typeUsername")}
          value={username}
          onChange={(e) => handleInputChange("username", e.target.value)}
          className={cn(errors.username && "border-destructive focus-visible:ring-destructive")}
        />
        {errors.username && (
          <span className="text-destructive text-sm">{errors.username}</span>
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
            onChange={(e) => handleInputChange("password", e.target.value)}
          />
          <button
            type="button"
            className="absolute ltr:right-3 rtl:left-3 cursor-pointer"
            onClick={togglePasswordVisibility}
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
          t("verifyEmail")
        )}
      </Button>
    </form>
  );
};

export default RegisterWithEmailForm;
