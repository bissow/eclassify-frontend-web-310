import { toast } from "sonner";

export const validateVerificationFields = ({
  values = {},
  filePreviews = {},
  fields = [],
  t,
}) => {
  for (const field of fields) {
    const { id, name, type, required, is_required, min_length } = field;
    const isRequired = (required ?? is_required ?? 0) === 1;
    const value = values[id];

    if (isRequired) {
      const isMissing =
        type === "checkbox"
          ? !Array.isArray(value) || value.length === 0
          : type === "fileinput"
            ? !value && !filePreviews[id]
            : value === undefined || value === null || value === "";

      if (isMissing) {
        const key = ["checkbox", "radio"].includes(type)
          ? t("selectAtleastOne")
          : t("fillDetails");
        toast.error(`${key} ${name}.`);
        return false;
      }
    }

    if (value && min_length && ["textbox", "number"].includes(type)) {
      const valStr = String(type === "textbox" ? value.trim() : value);
      if (valStr.length < min_length) {
        toast.error(
          type === "number"
            ? `${name} ${t("mustBeAtleast")} ${min_length} ${t("digitLong")}`
            : `${name} ${t("mustBeAtleast")} ${min_length} ${t("charactersLong")}`
        );
        return false;
      }
    }
  }

  return true;
};
