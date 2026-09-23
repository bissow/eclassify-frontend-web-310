import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getIsRtl } from "@/store/slices/languageSlice";
import {
  getCurrencyIsoCode,
  getCurrencyPosition,
  getCurrencySymbol,
  getGeminiAiEnabled,
} from "@/store/slices/settingSlice";
import { useTranslation } from "@/lang/useTranslation";
import { generateSlug } from "@/features/listing/lib/slug";
import { generateDescriptionApi } from "@/lib/api";
import PhoneInput from "react-phone-input-2";
import { NumericFormat } from "react-number-format";
import { useState } from "react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { SparkleIcon } from "@phosphor-icons/react";

const MainDetails = ({
  setTranslations,
  current,
  langId,
  handleDetailsSubmit,
  is_job_category,
  isPriceOptional,
  defaultLangId,
  currencies,
  handleDeatilsBack
}) => {
  const { t } = useTranslation();
  const currencyPosition = useSelector(getCurrencyPosition);
  const currencySymbol = useSelector(getCurrencySymbol);
  const currencyIsoCode = useSelector(getCurrencyIsoCode);
  const isRTL = useSelector(getIsRtl);
  const isGeminiAiEnabled = useSelector(getGeminiAiEnabled);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDescription = async () => {
    if (!current.name?.trim()) {
      toast.error(t("titleRequired"));
      return;
    }
    setIsGenerating(true);
    try {
      const res = await generateDescriptionApi.generateDescription({
        title: current.name,
        language_id: langId,
        ...(current.price ? { price: current.price } : {}),
        ...(selectedCurrency?.iso_code ? { currency_iso_code: selectedCurrency.iso_code } : {}),
      });
      if (res.data.error === false) {
        const description = res?.data?.data?.description;
        if (description) {
          setTranslations((prev) => ({
            ...prev,
            [langId]: { ...prev[langId], description },
          }));
        }
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error(t("somethingWentWrong"));
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedCurrency = currencies?.find(
    (curr) => curr?.id === current?.currency_id
  );
  // Use selected currency's symbol and position, or fallback to Redux settings
  const displaySymbol = selectedCurrency?.symbol || currencySymbol;
  const displayPosition = selectedCurrency?.position || currencyPosition;

  const placeholderLabel =
    displayPosition === "right" ? `00 ${displaySymbol}` : `${displaySymbol} 00`;

  const handleField = (field) => (e) => {
    const value = e.target.value;
    setTranslations((prev) => {
      const updatedLangData = {
        ...prev[langId],
        [field]: value,
      };
      // ✅ Only auto-generate slug if default language and field is title
      if (field === "name" && langId === defaultLangId) {
        updatedLangData.slug = generateSlug(value);
      }
      return {
        ...prev,
        [langId]: updatedLangData,
      };
    });
  };

  const handlePhoneChange = (value, data) => {
    const dial = data?.dialCode || ""; // Dial code like "91", "1"
    const iso2 = data?.countryCode || ""; // Region code like "in", "us", "ae"
    setTranslations((prev) => {
      // Deleting into the dial code leaves value shorter than dial — there is no
      // subscriber number left. Falling back to `value` here re-prepended the dial
      // on the next render, so the deleted digit came back.
      const pureMobile = value.startsWith(dial)
        ? value.slice(dial.length)
        : "";
      return {
        ...prev,
        [langId]: {
          ...prev[langId],
          contact: pureMobile,
          country_code: dial,
          region_code: iso2,
        },
      };
    });
  };

  const handlePriceChange = (values) => {
    setTranslations((prev) => ({
      ...prev,
      [langId]: { ...prev[langId], price: values.value },
    }));
  };

  const handleSalaryChange = (field) => (values) => {
    setTranslations((prev) => ({
      ...prev,
      [langId]: { ...prev[langId], [field]: values.value },
    }));
  };

  const handleCurrencyChange = (currencyId) => {
    setTranslations((prev) => ({
      ...prev,
      [langId]: {
        ...prev[langId],
        currency_id: Number(currencyId),
      },
    }));
  };

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="title"
          className={langId === defaultLangId ? "requiredInputLabel" : ""}
        >
          {t("title")}
        </Label>
        <Input
          type="text"
          name="title"
          id="title"
          placeholder={t("enterTitle")}
          value={current.name || ""}
          onChange={handleField("name")} //here send param as the one we need to send to the api
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="description"
          className={langId === defaultLangId ? "requiredInputLabel" : ""}
        >
          {t("description")}
        </Label>
        <Textarea
          name="description"
          id="description"
          cols="30"
          rows="3"
          placeholder={t("enterDescription")}
          className="border rounded-md px-4 py-2 outline-hidden"
          value={current.description || ""}
          onChange={handleField("description")}
        ></Textarea>
        {isGeminiAiEnabled && (
          <div className="flex justify-end">
            <button
              type="button"
              className="text-primary flex items-center gap-1 py-1 px-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={generateDescription}
              disabled={isGenerating}
            >
              <SparkleIcon className={`size-4 -scale-x-100 ${isGenerating ? "animate-spin" : ""}`} weight="fill" />
              <span className="text-sm">{isGenerating ? t("generating") : t("generateWithAi")}</span>
            </button>
          </div>
        )}
      </div>



      {/* Render the rest only for default language */}
      {langId === defaultLangId && (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="currency">{t("currency")}</Label>
            {
              currencies?.length > 0 ?
                <Select
                  value={current.currency_id?.toString()}
                  onValueChange={handleCurrencyChange}
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {currencies?.map((currency) => (
                        <SelectItem
                          key={currency.id}
                          value={currency.id.toString()}
                        >
                          {currency.iso_code} ({currency.symbol})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                :
                <Select
                  value={currencyIsoCode} // ✅ same default value you already have
                  disabled
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  {/* Required for RTL */}
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={currencyIsoCode}>
                        {currencyIsoCode} ({currencySymbol})
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
            }
          </div>
          {is_job_category ? (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="salaryMin">{t("salaryMin")}</Label>
                <NumericFormat
                  customInput={Input}
                  inputMode="numeric"
                  name="salaryMin"
                  id="salaryMin"
                  placeholder={placeholderLabel}
                  value={current.min_salary ?? ""}
                  thousandSeparator={selectedCurrency?.thousand_separator || ","}
                  decimalScale={0}
                  allowNegative={false}
                  onValueChange={handleSalaryChange("min_salary")}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="salaryMax">{t("salaryMax")}</Label>
                <NumericFormat
                  customInput={Input}
                  inputMode="numeric"
                  name="salaryMax"
                  id="salaryMax"
                  placeholder={placeholderLabel}
                  value={current.max_salary ?? ""}
                  thousandSeparator={selectedCurrency?.thousand_separator || ","}
                  decimalScale={0}
                  allowNegative={false}
                  onValueChange={handleSalaryChange("max_salary")}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="price"
                className={
                  !isPriceOptional && langId === defaultLangId
                    ? "requiredInputLabel"
                    : ""
                }
              >
                {t("price")}
              </Label>
              <div className="relative">
                <span
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none",
                    displayPosition === "right" ? "right-3" : "left-3"
                  )}
                >
                  {displaySymbol}
                </span>
                <NumericFormat
                  customInput={Input}
                  inputMode="decimal"
                  name="price"
                  id="price"
                  placeholder="00"
                  value={current.price ?? ""}
                  thousandSeparator={selectedCurrency?.thousand_separator || ","}
                  decimalSeparator={selectedCurrency?.decimal_separator || "."}
                  allowNegative={false}
                  onValueChange={handlePriceChange}
                  style={
                    displayPosition === "right"
                      ? { paddingRight: `calc(${displaySymbol.length}ch + 1.5rem)` }
                      : { paddingLeft: `calc(${displaySymbol.length}ch + 1.5rem)` }
                  }
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="phonenumber">{t("phoneNumber")}</Label>
            <PhoneInput
              country={process.env.NEXT_PUBLIC_DEFAULT_COUNTRY}
              value={`${current.country_code}${current.contact}`}
              onChange={(phone, data) => handlePhoneChange(phone, data)}
              inputProps={{ name: "phonenumber", id: "phonenumber" }}
              containerClass="border border-border rounded-md focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
              inputClass="!border-0 !h-10 !w-full !bg-transparent !outline-none !shadow-none"
              buttonClass="!border-0 !border-r !bg-transparent"
              enableLongNumbers
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">
              {t("slug")}{" "}
              <span className="text-muted-foreground text-xs">
                ({t("allowedSlug")})
              </span>
            </Label>
            <Input
              type="text"
              name="slug"
              id="slug"
              placeholder={t("enterSlug")}
              value={current.slug || ""}
              onChange={handleField("slug")}
            />
          </div>
        </>
      )}
      <div className="flex justify-end gap-3">
        <button
          className="bg-black text-white px-4 py-2 rounded-md text-xl font-light"
          onClick={handleDeatilsBack}
        >
          {t("back")}
        </button>
        <button
          className="bg-primary text-white  px-4 py-2 rounded-md text-xl font-light"
          onClick={handleDetailsSubmit}
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
};

export default MainDetails;
