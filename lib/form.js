"use client";
import { toast } from "sonner";
import { isPdf } from "@/lib/media";

export const handleKeyDown = (e, maxLength) => {
  if (maxLength === null || maxLength === undefined) {
    return;
  }
  const value = e.target.value;
  // Allow control keys (Backspace, Delete, Arrow keys, etc.)
  const controlKeys = [
    "Backspace",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Delete",
    "Tab",
  ];

  if (value.length >= maxLength && !controlKeys.includes(e.key)) {
    e.preventDefault();
  }
};

export const inpNum = (e) => {
  e = e || window.event;
  var charCode = typeof e.which == "undefined" ? e.keyCode : e.which;
  var charStr = String.fromCharCode(charCode);
  if (!charStr.match(/^[0-9]+$/)) {
    e.preventDefault();
  }
};


export const getFilteredCustomFields = (
  allTranslatedFields,
  currentLanguageId
) => {
  const fields = Array.isArray(allTranslatedFields) ? allTranslatedFields : [];
  const fieldMap = new Map();

  for (const field of fields) {
    const id = field.id;
    const val =
      field.type === "fileinput"
        ? Array.isArray(field.value)
          ? field.value[0]
          : field.value
        : field.translated_value;

    const isEmpty =
      val === null ||
      val === "" ||
      (Array.isArray(val) &&
        (val.length === 0 ||
          (val.length === 1 && (val[0] === "" || val[0] === null))));

    if (isEmpty) continue;

    // Prefer current language or store the first available
    if (!fieldMap.has(id) || field.language_id === currentLanguageId) {
      fieldMap.set(id, field);
    }
  }

  return Array.from(fieldMap.values());
};

export const prefillVerificationDetails = ({
  data,
  languages,
  defaultLangId,
  extraFieldValue,
  setFilePreviews,
}) => {
  const tempExtraDetails = {};

  languages.forEach((lang) => {
    const isDefault = lang.id === defaultLangId;
    const perLang = {};
    data.forEach((field) => {
      const fieldId = field.id;

      if (!isDefault && field.type !== "textbox") return;

      const extraField = extraFieldValue.find(
        (item) => item.language_id === lang.id && item.id === fieldId
      );
      const fieldValue = extraField?.value || null;
      switch (field.type) {
        case "checkbox":
          perLang[fieldId] = fieldValue || [];
          break;

        case "radio":
          perLang[fieldId] = fieldValue ? fieldValue[0] : "";
          break;

        case "fileinput":
          if (isDefault && fieldValue?.length) {
            setFilePreviews?.((prev) => ({
              ...prev,
              [fieldId]: {
                url: fieldValue[0],
                isPdf: isPdf(fieldValue[0]),
              },
            }));
          }
          perLang[fieldId] = "";
          break;

        default:
          perLang[fieldId] = fieldValue ? fieldValue[0] : "";
      }
    });

    tempExtraDetails[lang.id] = perLang;
  });

  return tempExtraDetails;
};

// Built per call so the labels resolve against the caller's `t` — a module-level
// map would freeze every message to English at import time.
const buildErrorCodes = (t) => ({
  "auth/user-not-found": t("userNotFound"),
  "auth/wrong-password": t("invalidPassword"),
  "auth/email-already-in-use": t("emailInUse"),
  "auth/invalid-email": t("invalidEmail"),
  "auth/user-disabled": t("userAccountDisabled"),
  "auth/too-many-requests": t("tooManyRequests"),
  "auth/operation-not-allowed": t("operationNotAllowed"),
  "auth/internal-error": t("internalError"),
  "auth/invalid-login-credentials": t("incorrectDetails"),
  "auth/invalid-credential": t("incorrectDetails"),
  "auth/admin-restricted-operation": t("adminOnlyOperation"),
  "auth/already-initialized": t("alreadyInitialized"),
  "auth/app-not-authorized": t("appNotAuthorized"),
  "auth/app-not-installed": t("appNotInstalled"),
  "auth/argument-error": t("argumentError"),
  "auth/captcha-check-failed": t("captchaCheckFailed"),
  "auth/code-expired": t("codeExpired"),
  "auth/cordova-not-ready": t("cordovaNotReady"),
  "auth/cors-unsupported": t("corsUnsupported"),
  "auth/credential-already-in-use": t("credentialAlreadyInUse"),
  "auth/custom-token-mismatch": t("customTokenMismatch"),
  "auth/requires-recent-login": t("requiresRecentLogin"),
  "auth/dependent-sdk-initialized-before-auth": t(
    "dependentSdkInitializedBeforeAuth"
  ),
  "auth/dynamic-link-not-activated": t("dynamicLinkNotActivated"),
  "auth/email-change-needs-verification": t("emailChangeNeedsVerification"),
  "auth/emulator-config-failed": t("emulatorConfigFailed"),
  "auth/expired-action-code": t("expiredActionCode"),
  "auth/cancelled-popup-request": t("cancelledPopupRequest"),
  "auth/invalid-api-key": t("invalidApiKey"),
  "auth/invalid-app-credential": t("invalidAppCredential"),
  "auth/invalid-app-id": t("invalidAppId"),
  "auth/invalid-user-token": t("invalidUserToken"),
  "auth/invalid-auth-event": t("invalidAuthEvent"),
  "auth/invalid-cert-hash": t("invalidCertHash"),
  "auth/invalid-verification-code": t("invalidVerificationCode"),
  "auth/invalid-continue-uri": t("invalidContinueUri"),
  "auth/invalid-cordova-configuration": t("invalidCordovaConfiguration"),
  "auth/invalid-custom-token": t("invalidCustomToken"),
  "auth/invalid-dynamic-link-domain": t("invalidDynamicLinkDomain"),
  "auth/invalid-emulator-scheme": t("invalidEmulatorScheme"),
  "auth/invalid-message-payload": t("invalidMessagePayload"),
  "auth/invalid-multi-factor-session": t("invalidMultiFactorSession"),
  "auth/invalid-oauth-client-id": t("invalidOauthClientId"),
  "auth/invalid-oauth-provider": t("invalidOauthProvider"),
  "auth/invalid-action-code": t("invalidActionCode"),
  "auth/unauthorized-domain": t("unauthorizedDomain"),
  "auth/invalid-persistence-type": t("invalidPersistenceType"),
  "auth/invalid-phone-number": t("invalidPhoneNumber"),
  "auth/invalid-provider-id": t("invalidProviderId"),
  "auth/invalid-recaptcha-action": t("invalidRecaptchaAction"),
  "auth/invalid-recaptcha-token": t("invalidRecaptchaToken"),
  "auth/invalid-recaptcha-version": t("invalidRecaptchaVersion"),
  "auth/invalid-recipient-email": t("invalidRecipientEmail"),
  "auth/invalid-req-type": t("invalidReqType"),
  "auth/invalid-sender": t("invalidSender"),
  "auth/invalid-verification-id": t("invalidVerificationId"),
  "auth/invalid-tenant-id": t("invalidTenantId"),
  "auth/multi-factor-info-not-found": t("multiFactorInfoNotFound"),
  "auth/multi-factor-auth-required": t("multiFactorAuthRequired"),
  "auth/missing-android-pkg-name": t("missingAndroidPkgName"),
  "auth/missing-app-credential": t("missingAppCredential"),
  "auth/auth-domain-config-required": t("authDomainConfigRequired"),
  "auth/missing-client-type": t("missingClientType"),
  "auth/missing-verification-code": t("missingVerificationCode"),
  "auth/missing-continue-uri": t("missingContinueUri"),
  "auth/missing-iframe-start": t("missingIframeStart"),
  "auth/missing-ios-bundle-id": t("missingIosBundleId"),
  "auth/missing-multi-factor-info": t("missingMultiFactorInfo"),
  "auth/missing-multi-factor-session": t("missingMultiFactorSession"),
  "auth/missing-or-invalid-nonce": t("missingOrInvalidNonce"),
  "auth/missing-phone-number": t("missingPhoneNumber"),
  "auth/missing-recaptcha-token": t("missingRecaptchaToken"),
  "auth/missing-recaptcha-version": t("missingRecaptchaVersion"),
  "auth/missing-verification-id": t("missingVerificationId"),
  "auth/app-deleted": t("appDeleted"),
  "auth/account-exists-with-different-credential": t(
    "accountExistsWithDifferentCredential"
  ),
  "auth/network-request-failed": t("networkRequestFailed"),
  "auth/no-auth-event": t("noAuthEvent"),
  "auth/no-such-provider": t("noSuchProvider"),
  "auth/null-user": t("nullUser"),
  "auth/operation-not-supported-in-this-environment": t(
    "operationNotSupportedInThisEnvironment"
  ),
  "auth/popup-blocked": t("popupBlocked"),
  "auth/popup-closed-by-user": t("popupClosedByUser"),
  "auth/provider-already-linked": t("providerAlreadyLinked"),
  "auth/quota-exceeded": t("quotaExceeded"),
  "auth/recaptcha-not-enabled": t("recaptchaNotEnabled"),
  "auth/redirect-cancelled-by-user": t("redirectCancelledByUser"),
  "auth/redirect-operation-pending": t("redirectOperationPending"),
  "auth/rejected-credential": t("rejectedCredential"),
  "auth/second-factor-already-in-use": t("secondFactorAlreadyInUse"),
  "auth/maximum-second-factor-count-exceeded": t(
    "maximumSecondFactorCountExceeded"
  ),
  "auth/tenant-id-mismatch": t("tenantIdMismatch"),
  "auth/timeout": t("timeout"),
  "auth/user-token-expired": t("userTokenExpired"),
  "auth/unauthorized-continue-uri": t("unauthorizedContinueUri"),
  "auth/unsupported-first-factor": t("unsupportedFirstFactor"),
  "auth/unsupported-persistence-type": t("unsupportedPersistenceType"),
  "auth/unsupported-tenant-operation": t("unsupportedTenantOperation"),
  "auth/unverified-email": t("unverifiedEmail"),
  "auth/user-cancelled": t("userCancelled"),
  "auth/user-mismatch": t("userMismatch"),
  "auth/user-signed-out": t("userSignedOut"),
  "auth/weak-password": t("weakPassword"),
  "auth/web-storage-unsupported": t("webStorageUnsupported"),
  "auth/missing-email": t("addEmail"),
});

// `t` comes from the calling component's useTranslation() — this file is a plain
// module, so it can't hold a hook of its own.
export const handleFirebaseAuthError = (errorCode, t) => {
  const errorCodes = buildErrorCodes(t);
  if (errorCodes.hasOwnProperty(errorCode)) {
    toast.error(errorCodes[errorCode]);
  } else {
    // Unmapped code — surface it so the raw Firebase string is still debuggable
    toast.error(`${t("errorOccurred")}:${errorCode}`);
  }
  // Optionally, you can add additional logic here to handle the error
  // For example, display an error message to the user, redirect to an error page, etc.
};
