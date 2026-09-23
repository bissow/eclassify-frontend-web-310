import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lang/useTranslation";
import { generateMetaDetailsApi } from "@/lib/api";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { getGeminiAiEnabled } from "@/store/slices/settingSlice";
import { SparkleIcon, XIcon } from "@phosphor-icons/react";

const MetaDetails = ({ langId, seoDetails, setSeoDetails, onNext, handleGoBack, adTitle, adPrice, currencyIsoCode }) => {
  const { t } = useTranslation();

    const [keywordInput, setKeywordInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const isGeminiAiEnabled = useSelector(getGeminiAiEnabled);

    // ✅ Memoized current SEO
    const currentSeo = useMemo(
        () => seoDetails.find(item => item.language_id === langId) || {},
        [seoDetails, langId]
    );

    const updateSeoForLang = (prev, updater) => {
        const index = prev.findIndex(item => item.language_id === langId);

        if (index !== -1) {
            const newArr = [...prev];
            newArr[index] = updater(prev[index]);
            return newArr;
        }

        return [...prev, updater({ language_id: langId })];
    };

    const handleField = (field) => (e) => {
        const value = e.target.value;

        setSeoDetails(prev =>
            updateSeoForLang(prev, item => ({
                ...item,
                [field]: value
            }))
        );
    }

    const removeKeyword = (tagToRemove) => {
        setSeoDetails(prev =>
            updateSeoForLang(prev, item => ({
                ...item,
                meta_keywords: (item.meta_keywords || "").split(",").filter(k => k && k !== tagToRemove).join(",")
            }))
        );
    }

    const addKeyword = (e) => {
        if (e.key !== "Enter" && e.key !== ",") return;
        e.preventDefault();
        const tag = keywordInput.trim().toLowerCase();
        if (!tag) return;
        setSeoDetails(prev =>
            updateSeoForLang(prev, item => {
                const existing = item.meta_keywords || "";
                const keywords = existing ? existing.split(",") : [];

                if (keywords.includes(tag)) return item;

                return {
                    ...item,
                    meta_keywords: existing ? `${existing},${tag}` : tag
                };
            })
        );
        setKeywordInput("");
    };


    const generateWithAi = async () => {
        if (!adTitle?.trim()) {
            toast.error(t("titleIsRequired"));
            return;
        }

        if (adTitle.length >= 256) {
            toast.error(t("metaTitleShouldBeLessThan256Characters"));
            return;
        }

        setIsGenerating(true);
        try {
            const res = await generateMetaDetailsApi.generateMetaDetail({
                title: adTitle,
                ...(adPrice ? { price: adPrice } : {}),
                ...(currencyIsoCode ? { currency_iso_code: currencyIsoCode } : {}),
                language_id: langId,
            });

            if (res.data.error === false) {
                const data = res?.data?.data;
                if (data) {
                    setSeoDetails(prev =>
                        updateSeoForLang(prev, item => ({
                            ...item,
                            meta_title: data.meta_title ?? item.meta_title ?? "",
                            meta_description: data.meta_description ?? item.meta_description ?? "",
                            meta_keywords: data.meta_keywords ?? item.meta_keywords ?? "",
                        }))
                    );
                }
            } else {
                toast.error(res.data.message)
            }
        } catch {
            toast.error(t("somethingWentWrong"));
        } finally {
            setIsGenerating(false);
        }
    }


    return (
        <div className="flex flex-col w-full gap-6">

            <div className="flex items-center gap-2 justify-between">
                <h6 className="text-lg sm:text-xl font-medium">{t("seoDetails")}</h6>
                {isGeminiAiEnabled && (
                    <button
                        className="text-primary flex items-center gap-1 py-1 px-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={generateWithAi}
                        disabled={isGenerating}
                    >
                        <SparkleIcon className={`size-4 -scale-x-100 ${isGenerating ? "animate-spin" : ""}`} weight="fill" />
                        <span className="text-sm">{isGenerating ? t("generating") : t("generateWithAi")}</span>
                    </button>
                )}
            </div>

            {/* Meta Title */}
            <div className="flex flex-col gap-2">
                <Label htmlFor="meta_title">{t("metaTitle")}</Label>
                <Input
                    id="meta_title"
                    placeholder={t("enterMetaTitle")}
                    value={currentSeo.meta_title || ""}
                    onChange={handleField("meta_title")}
                />
            </div>

            {/* Meta Description */}
            <div className="flex flex-col gap-2">
                <Label htmlFor="meta_description">{t("metaDescription")}</Label>
                <Textarea
                    id="meta_description"
                    placeholder={t("enterMetaDescription")}
                    value={currentSeo.meta_description || ""}
                    onChange={handleField("meta_description")}
                />
            </div>

            {/* Keywords */}
            <div className="flex flex-col gap-2">
                <Label>{t("keywords")}</Label>

                <div className="flex flex-wrap gap-2 p-2 border rounded-md focus-within:ring-2 focus-within:ring-primary">
                    {(currentSeo.meta_keywords || "").split(",").filter(Boolean).map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <XIcon className="cursor-pointer hover:text-destructive" onClick={() => removeKeyword(tag)} />
                        </Badge>
                    ))}

                    <input
                        className="flex-1 text-sm outline-none"
                        placeholder={t("typeAndPressEnter")}
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={addKeyword}
                        onBlur={() => {
                            if (keywordInput.trim()) {
                                addKeyword({ key: "Enter", preventDefault: () => { } });
                            }
                        }}
                    />
                </div>
            </div>

            {/* Schema */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Label htmlFor="schema">
                        {t("schema")}{" "}
                        <span className="text-xs text-muted-foreground">({t("addManually")})</span>
                    </Label>

                </div>
                <Textarea
                    id="schema"
                    placeholder={t("enterSchemaCode")}
                    value={currentSeo.schema || ""}
                    onChange={handleField("schema")}
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4">
                <button
                    className="bg-black text-white px-4 text-xl py-2 rounded-md"
                    onClick={handleGoBack}
                >
                    {t("back")}
                </button>
                <button
                    className="bg-primary text-white px-4 text-xl py-2 rounded-md"
                    onClick={onNext}
                >
                    {t("next")}
                </button>
            </div>
        </div>
    );
};

export default MetaDetails;