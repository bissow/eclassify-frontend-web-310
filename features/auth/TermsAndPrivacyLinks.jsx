import CustomLink from "@/components/common/CustomLink";
import { Checkbox } from "@/components/ui/checkbox";
import { settingsData } from "@/store/slices/settingSlice";
import { useTranslation } from "@/lang/useTranslation";
import { useSelector } from "react-redux";

const TermsAndPrivacyLinks = ({ OnHide, consentChecked, setConsentChecked, error }) => {
  const { t } = useTranslation();
  const settings = useSelector(settingsData);
  const showCheckbox = typeof setConsentChecked === "function";

  const links = (
    <>
      <CustomLink
        href="/terms-and-condition"
        className="text-primary underline"
        onClick={OnHide}
      >
        {t("termsService")}
      </CustomLink>{" "}
      {t("and")}{" "}
      <CustomLink
        href="/privacy-policy"
        className="text-primary underline"
        onClick={OnHide}
      >
        {t("privacyPolicy")}
      </CustomLink>
    </>
  );

  if (showCheckbox) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <Checkbox
            id="gdpr-consent"
            checked={consentChecked}
            onCheckedChange={setConsentChecked}
            className="mt-0.5"
          />
          <label htmlFor="gdpr-consent" className="text-sm leading-snug cursor-pointer">
            {t("agreeSignIn")} {settings?.company_name} {links}
          </label>
        </div>
        {error && <span className="text-destructive text-sm">{error}</span>}
      </div>
    );
  }

  return (
    <div className="text-center">
      {t("agreeSignIn")} {settings?.company_name} <br />
      {links}
    </div>
  );
};

export default TermsAndPrivacyLinks;
