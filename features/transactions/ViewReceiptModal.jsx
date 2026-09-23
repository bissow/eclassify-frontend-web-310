'use client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/lang/useTranslation";
import { getPaymentReceiptApi } from "@/lib/api";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRef } from "react";
import dynamic from "next/dynamic";

const DownloadPdf = dynamic(() => import("@/features/transactions/DownloadPdf"), {
  ssr: false,
});



const ViewReceiptModal = ({ isOpen, onOpenChange, transactionId }) => {
  const { t } = useTranslation();
  const [htmlContent, setHtmlContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchReceipt();
    } else if (!isOpen) {
      setHtmlContent("");
    }
  }, [isOpen, transactionId]);

  const fetchReceipt = async () => {
    try {
      setIsLoading(true);
      const res = await getPaymentReceiptApi.getPaymentReceipt({
        payment_transaction_id: transactionId,
      });
      // Directly set htmlContent from res.data as it's raw HTML
      if (res?.data) {
        setHtmlContent(res?.data);
      } else {
        toast.error(t("somethingWentWrong"));
        onOpenChange(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(t("somethingWentWrong"));
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            <span>
              {t("paymentReceipt")}
            </span>

          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 min-h-100 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <CircleNotchIcon className="size-8 animate-spin text-primary" weight="bold" />
            </div>
          ) : htmlContent ? (
            <>
              <div
                ref={contentRef}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
              {htmlContent && !isLoading && (
                <div className="flex justify-end mt-6" >
                  <DownloadPdf contentRef={contentRef} transactionId={transactionId} />
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {t("noReceiptFound")}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewReceiptModal;
