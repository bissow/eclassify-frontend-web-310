import { isPdf } from "@/lib/media";

export const prefillVerificationFields = ({ saved = [], setFilePreviews }) => {
  const values = {};

  for (const row of saved) {
    const id = row.verification_field_id;
    const value = row.value;
    if (row.verification_field?.type === "checkbox") {
      values[id] = String(value).split(",");
    } else if (row.verification_field?.type === "fileinput") {
      setFilePreviews?.((prev) => ({
        ...prev,
        [id]: { url: value, isPdf: isPdf(value) },
      }));
    } else {
      values[id] = value;
    }
  }

  return values;
};
