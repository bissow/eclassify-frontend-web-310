import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslation } from "@/lang/useTranslation";
import { resetPasswordApi, userSignUpApi } from "@/lib/api";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CircleNotchIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

const ResetPasswordScreen = ({
  formattedNumber,
  countryCode,
  onSuccess,
  onCancel,
  FirebaseId,
}) => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [resetPasswordLoader, setResetPasswordLoader] = useState(false);
  const [errors, setErrors] = useState({ password: "" });

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      setErrors({ password: t("passwordRequired") });
      return;
    }
    if (newPassword.length < 6) {
      setErrors({ password: t("passwordTooShort") });
      return;
    }

    setResetPasswordLoader(true);
    try {
      const loginResponse = await userSignUpApi.userSignup({
        mobile: formattedNumber,
        country_code: countryCode,
        type: "phone",
        firebase_id: FirebaseId,
      });

      const token = loginResponse?.data?.token;

      if (!token) {
        toast.error(t("errorOccurred"));
        return;
      }

      const response = await resetPasswordApi.resetPassword({
        number: formattedNumber,
        country_code: countryCode,
        new_password: newPassword,
        token: token,
      });

      if (response?.data?.error === false) {
        toast.success(response?.data?.message);
        onSuccess();
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(t("errorOccurred"));
    } finally {
      setResetPasswordLoader(false);
    }
  };

  return (
    <form className="flex flex-col gap-6 mt-3.5" onSubmit={handleResetPassword}>
      <div className="labelInputCont">
        <Label className="requiredInputLabel">{t("newPassword")}</Label>
        <div className="flex items-center relative">
          <Input
            type={isPasswordVisible ? "text" : "password"}
            placeholder={t("enterNewPassword")}
            className={cn("ltr:pr-9 rtl:pl-9", errors.password && "border-destructive focus-visible:ring-destructive")}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setErrors({ password: "" });
            }}
          />
          <button
            type="button"
            className="absolute ltr:right-3 rtl:left-3 cursor-pointer"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
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
      <Button
        type="submit"
        disabled={resetPasswordLoader}
        className="text-xl text-white font-light px-4 py-2"
        size="big"
      >
        {resetPasswordLoader ? (
          <CircleNotchIcon className="size-6! animate-spin" weight="bold" />
        ) : (
          t("submitResetPassword")
        )}
      </Button>
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          className="text-lg text-black font-light px-4 py-2"
          size="big"
          onClick={onCancel}
        >
          {t("cancel")}
        </Button>
      )}
    </form>
  );
};

export default ResetPasswordScreen;
