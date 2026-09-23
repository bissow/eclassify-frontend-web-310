import html2pdf from "html2pdf.js";
import { useTranslation } from "@/lang/useTranslation";
import { DownloadSimpleIcon } from "@phosphor-icons/react";

const DownloadPdf = ({ contentRef, transactionId }) => {
  const { t } = useTranslation();

    const handleDownload = () => {
        if (!contentRef.current) return;
        html2pdf()
            .from(contentRef.current)
            .set({
                filename: `receipt-${transactionId}.pdf`,
                margin: 10,
                html2canvas: { scale: 2, useCORS: true, allowTaint: true, },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            })
            .save();
    };

    return (
        <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-md text-sm"
        >
            <DownloadSimpleIcon weight="bold" />
            {t("download")}
        </button>
    )
}

export default DownloadPdf