"use client";
import BreadCrumb from "@/components/common/BreadCrumb";
import { useTranslation } from "@/lang/useTranslation";
import { handleKeyDown, inpNum } from "@/lib/form";
import { getVerificationFiledsApi, getVerificationStatusApi, sendVerificationReqApi } from "@/lib/api";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import CustomLink from "@/components/common/CustomLink";
import Checkauth from "@/features/auth/Checkauth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageLoader from "@/components/common/PageLoader";
import CustomImage from "@/components/common/CustomImage";
import { useNavigate } from "@/hooks/useNavigate";
import { useParams } from "next/navigation";
import { LinkIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { validateVerificationFields } from "@/features/user-verification/lib/validation";
import { prefillVerificationFields } from "@/features/user-verification/lib/prefill";

const UserVerification = () => {
  const { t } = useTranslation();
  const { navigate } = useNavigate();
  const [UserVeriFields, setUserVeriFields] = useState([]);
  const [filePreviews, setFilePreviews] = useState({});
  const [VerificationStatus, setVerificationStatus] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { lang: langCode } = useParams()

  // Verification fields are single-language: values are kept flat as { [fieldId]: value }
  // and only wrapped in the default language when passed to the shared custom-field helpers.
  const [fieldValues, setFieldValues] = useState({});

  useEffect(() => {
    fetchVerificationData();
  }, [langCode]);

  const fetchVerificationData = async () => {
    try {
      setVerificationLoading(true);

      // Step 1: Fetch field definitions
      const fieldsRes = await getVerificationFiledsApi.getVerificationFileds();
      const fieldData = fieldsRes?.data?.data || [];
      setUserVeriFields(fieldData);

      // Step 2: Fetch verification values
      const statusRes = await getVerificationStatusApi.getVerificationStatus();
      const statusData = statusRes?.data?.data;
      const statusError = statusRes?.data?.error;

      if (statusError) {
        setVerificationStatus("not applied");
      } else {
        setVerificationStatus(statusData?.status);
      }

      // Step 3: Prefill from the previous submission
      setFieldValues(
        prefillVerificationFields({
          saved:
            statusData?.status === "not applied"
              ? []
              : statusData?.verification_field_values || [],
          setFilePreviews,
        })
      );
    } catch (error) {
      console.log(error);
    } finally {
      setVerificationLoading(false);
    }
  };
  const renderCustomFields = (field) => {
    let {
      id,
      name,
      translated_name,
      type,
      translated_value,
      values,
      min_length,
      max_length,
    } = field;

    const inputProps = {
      id,
      name: id,
      onChange: (e) => handleChange(id, e.target.value),
      value: fieldValues[id] || "",
      ...(type === "number"
        ? { min: min_length, max: max_length }
        : { minLength: min_length, maxLength: max_length }),
    };

    switch (type) {
      case "number":
        return (
          <div className="flex flex-col">
            <Input
              type="number"
              inputMode="numeric"
              placeholder={`${t("enter")} ${translated_name || name}`}
              {...inputProps}
              onKeyDown={(e) => handleKeyDown(e, max_length)}
              onKeyPress={(e) => inpNum(e)}
              className="border rounded-md px-4 py-2 outline-hidden"
            />
            {max_length && (
              <span className="flex justify-end text-muted-foreground text-sm">
                {`${fieldValues[id]?.length ?? 0}/${max_length}`}
              </span>
            )}
          </div>
        );
      case "textbox": {
        return (
          <div className=" flex flex-col">
            <Textarea
              placeholder={`${t("enter")} ${translated_name || name}`}
              {...inputProps}
            />
            {max_length && (
              <span className=" flex justify-end text-muted-foreground text-sm">
                {`${fieldValues[id]?.length ?? 0}/${max_length}`}
              </span>
            )}
          </div>
        );
      }

      case "dropdown":
        return (
          <div className="w-full">
            <Select
              value={fieldValues[id] || ""}
              onValueChange={(value) => handleChange(id, value)}
              id={id}
              name={id}
            >
              <SelectTrigger className="outline-hidden focus:outline-hidden">
                <SelectValue
                  className="font-semibold"
                  placeholder={`${t("select")} ${translated_name || name}`}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel value="">
                    {t("select")} {translated_name || name}
                  </SelectLabel>
                  {values?.map((option, index) => (
                    <SelectItem
                      id={option}
                      className="font-semibold"
                      key={index}
                      value={option}
                    >
                      {translated_value?.[index] || option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        );
      case "checkbox":
        return (
          <div className="flex w-full flex-wrap gap-2">
            {values?.map((value, index) => {
              return (
                <div key={index} className="flex gap-1 items-center">
                  <Checkbox
                    id={id}
                    value={value}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(id, value, checked)
                    }
                    checked={fieldValues[id]?.includes(value)}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {translated_value?.[index] || value}
                  </label>
                </div>
              );
            })}
          </div>
        );
      case "radio":
        return (
          <RadioGroup
            value={fieldValues[id] || ""}
            onValueChange={(value) => handleChange(id, value)}
            className="flex flex-wrap gap-3"
            id={id}
            name={id}
          >
            {values?.map((option, index) => (
              <div key={option} className="flex items-center">
                <RadioGroupItem
                  value={option}
                  id={option}
                  className="sr-only peer"
                />
                <label
                  htmlFor={option}
                  className={`${fieldValues[id] === option
                    ? "bg-primary text-white"
                    : "bg-white"
                    } border rounded-md px-4 py-2 cursor-pointer transition-colors flex items-center`}
                >
                  {translated_value?.[index] || option}
                </label>
              </div>
            ))}
          </RadioGroup>
        );
      case "fileinput":
        const fileUrl = filePreviews?.[id]?.url;
        const isPdf = filePreviews?.[id]?.isPdf;
        return (
          <>
            <label htmlFor={id} className="flex gap-2 items-center">
              <div className="flex items-center gap-1 cursor-pointer border border-gray-300 px-2.5 py-1 rounded w-fit">
                <UploadSimpleIcon size={24} weight="bold" />
              </div>
              {fileUrl && (
                <div className="flex items-center gap-1 text-sm flex-nowrap wrap-break-word">
                  {isPdf ? (
                    <>
                      <LinkIcon weight="bold" />
                      <CustomLink
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("viewPdf")}
                      </CustomLink>
                    </>
                  ) : (
                    <CustomImage
                      src={fileUrl}
                      alt="Preview"
                      className="h-9 w-9 aspect-square"
                      height={36}
                      width={36}
                    />
                  )}
                </div>
              )}
            </label>
            <input
              type="file"
              id={id}
              name={id}
              className="hidden"
              onChange={(e) => handleFileChange(id, e.target.files[0])}
            />
            <span className="text-sm text-muted-foreground">
              {t("allowedFileType")}
            </span>
          </>
        );
      default:
        break;
    }
  };

  const handleFileChange = (id, file) => {
    if (file) {
      const allowedExtensions = /\.(jpg|jpeg|svg|png|pdf)$/i;
      if (!allowedExtensions.test(file.name)) {
        toast.error(t("notAllowedFile"));
        return;
      }
      const fileUrl = URL.createObjectURL(file);
      setFilePreviews((prev) => ({
        ...prev,
        [id]: {
          url: fileUrl,
          isPdf: /\.pdf$/i.test(file.name),
        },
      }));
      setFieldValues((prev) => ({ ...prev, [id]: file }));
    }
  };

  const handleCheckboxChange = (id, value, checked) => {
    setFieldValues((prev) => {
      const list = prev[id] || [];
      return {
        ...prev,
        [id]: checked ? [...list, value] : list.filter((v) => v !== value),
      };
    });
  };

  const handleChange = (id, value) =>
    setFieldValues((prev) => ({ ...prev, [id]: value ?? "" }));

  const handleVerify = async () => {
    if (VerificationStatus === "approved") {
      toast.error(t("verificationDoneAlready"));
      return;
    }
    if (
      VerificationStatus === "resubmitted" ||
      VerificationStatus === "pending" ||
      VerificationStatus === "submitted"
    ) {
      toast.error(t("verificationAlreadyInReview"));
      return;
    }

    if (
      validateVerificationFields({
        values: fieldValues,
        filePreviews,
        fields: UserVeriFields,
        t,
      })
    ) {
      setIsVerifying(true);
      const verification_field_files = Object.entries(fieldValues)
        .filter(([, value]) => value instanceof File)
        .map(([key, file]) => ({ key, files: [file] }));
      try {
        const res = await sendVerificationReqApi.sendVerificationReq({
          verification_field: fieldValues,
          verification_field_files,
        });
        if (res?.data?.error === false) {
          toast.success(res?.data?.message);
          navigate("/profile");
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsVerifying(false);
      }
    }
  };

  return (
    <>
      <BreadCrumb items={[{ name: t("userVerification") }]} />

      {verificationLoading ? (
        <PageLoader />
      ) : (
        <div className="container mt-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 justify-between">
              <h1 className="text-2xl font-semibold">
                {t("userVerification")}
              </h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 ">
              {UserVeriFields?.map((field) => {
                return (
                  <div
                    className="col-span-1 md:col-span-6 flex flex-col gap-2"
                    key={field?.id}
                  >
                    <Label
                      className={`${field?.is_required === 1 ? "requiredInputLabel" : ""}`}
                      htmlFor={field?.id}
                    >
                      {field?.translated_name || field?.name}
                    </Label>
                    {renderCustomFields(field)}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-black text-white text-xl rounded-md disabled:opacity-60"
                disabled={isVerifying}
                onClick={handleVerify}
              >
                {isVerifying ? t("loading") : t("verify")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkauth(UserVerification);
