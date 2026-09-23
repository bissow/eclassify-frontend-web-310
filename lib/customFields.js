import { toast } from "sonner";

// Dynamic custom-field helpers. Shared by Listing (create/edit) and UserVerification,
// which both render the same admin-defined custom fields.

// Custom-field (extra details) validation, per language.
export const validateExtraDetails = ({
  languages,
  defaultLangId,
  extraDetails,
  customFields,
  filePreviews,
  t,
}) => {
  for (const lang of languages) {
    const current = extraDetails?.[lang.id] || {};
    const previews = filePreviews?.[lang.id] || {};
    const isDefaultLang = lang.id === defaultLangId;
    const langLabel = isDefaultLang ? "" : `${lang.name}: `;

    for (const field of customFields) {
      const { id, name, type, required, is_required, min_length } = field;

      const requiredValue = required ?? is_required ?? 0;

      // Skip non-textbox fields in non-default languages
      if (!isDefaultLang && type !== "textbox") continue;

      const value = current[id];

      const isValueEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      const isRequired = isDefaultLang && requiredValue === 1;
      const shouldValidate = isRequired || (!isValueEmpty && !isDefaultLang);

      if (!shouldValidate) continue;

      const showError = (msg) => {
        toast.error(`${langLabel}${msg}`);
      };

      // === Required Validation
      const isMissing =
        (["textbox", "number", "radio", "dropdown"].includes(type) &&
          isValueEmpty) ||
        (type === "checkbox" &&
          (!Array.isArray(value) || value.length === 0)) ||
        (type === "fileinput" && !value && !previews[id]);

      if (isRequired && isMissing) {
        const key = ["checkbox", "radio"].includes(type)
          ? t("selectAtleastOne")
          : t("fillDetails");
        showError(`${key} ${name}.`);
        return false;
      }

      // === Min Length Validation
      if (value && min_length && ["textbox", "number"].includes(type)) {
        const valStr = String(type === "textbox" ? value.trim() : value);
        if (valStr.length < min_length) {
          const lengthError =
            type === "number"
              ? `${t("mustBeAtleast")} ${min_length} ${t("digitLong")}`
              : `${t("mustBeAtleast")} ${min_length} ${t("charactersLong")}`;
          showError(`${name} ${lengthError}`);
          return false;
        }
      }
    }
  }

  return true;
};

// Shape custom-field values (non-file) into the custom_field_translations payload.
export const prepareCustomFieldTranslations = (extraDetails = {}) => {
  const result = {};

  for (const langId in extraDetails) {
    const fields = extraDetails[langId];
    const cleanedFields = {};

    for (const fieldId in fields) {
      const value = fields[fieldId];

      if (
        Array.isArray(value) &&
        value.length > 0 &&
        !(value[0] instanceof File)
      ) {
        cleanedFields[fieldId] = value;
      } else if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !(value instanceof File)
      ) {
        cleanedFields[fieldId] = [String(value)];
      }
    }

    if (Object.keys(cleanedFields).length > 0) {
      result[langId] = cleanedFields;
    }
  }

  return JSON.stringify(result);
};

// Collect File values from the default language into the custom_field_files payload.
export const prepareCustomFieldFiles = (extraDetails, defaultLangId) => {
  const customFieldFiles = [];
  const defaultLangFields = extraDetails?.[defaultLangId] || {};

  Object.entries(defaultLangFields).forEach(([fieldId, value]) => {
    if (value instanceof File) {
      customFieldFiles.push({ key: fieldId, files: [value] });
    } else if (Array.isArray(value) && value[0] instanceof File) {
      customFieldFiles.push({ key: fieldId, files: value });
    }
  });

  return customFieldFiles;
};
