"use client";
import { getReduxCurrentLangCode } from "@/store/slices/languageSlice";
import { useSelector } from "react-redux";
import { useTranslation } from "@/lang/useTranslation";
import { formatDateMonthYear } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import NoData from "@/components/empty-states/NoData";
import { Badge } from "@/components/ui/badge";
import TransactionSkeleton from "@/features/transactions/TransactionSkeleton";
import { paymentTransactionApi } from "@/lib/api";
import { toast } from "sonner";
import Pagination from "@/components/common/Pagination";
import UploadReceiptModal from "@/features/transactions/UploadReceiptModal";
import ViewReceiptModal from "@/features/transactions/ViewReceiptModal";
import { EyeIcon } from "@phosphor-icons/react";

const Transactions = () => {
  const { t } = useTranslation();
  const langCode = useSelector(getReduxCurrentLangCode);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);

  const [transactionId, setTransactionId] = useState("");
  const [IsUploadRecipt, setIsUploadRecipt] = useState(false);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);


  const handleUploadReceipt = (id) => {
    setTransactionId(id);
    setIsUploadRecipt(true);
  };

  const handleViewReceipt = (id) => {
    setTransactionId(id);
    setIsReceiptModalOpen(true);
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const res = await paymentTransactionApi.transaction({
        page: currentPage,
      });
      setTotalPages(res.data.data.last_page);
      setCurrentPage(res.data.data.current_page);
      if (res?.data?.error === false) {
        setTransactions(res?.data?.data?.data);
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "succeed":
        return <Badge className="bg-green-500">{t("completed")}</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">{t("pending")}</Badge>;
      case "failed":
        return <Badge className="bg-red-500">{t("failed")}</Badge>;
      case "under review":
        return <Badge className="bg-blue-500">{t("underReview")}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      {isLoading ? (
        <TransactionSkeleton />
      ) : transactions.length > 0 ? (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-4 mt-2 md:hidden">
            {transactions.map((transaction) => (
              <div
                key={transaction?.id}
                className="border rounded-xl px-4 py-3 flex flex-col gap-3 bg-white"
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate flex-1">
                    {transaction?.order_id || "-"}
                  </span>
                  <span className="text-sm font-bold">
                    {transaction?.amount == 0 ? t("Free") : `$${transaction?.amount}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {formatDateMonthYear(transaction?.created_at, langCode)}
                  </span>
                  {transaction?.payment_status === "pending" &&
                    transaction?.payment_gateway === "BankTransfer" ? (
                    <button
                      onClick={() => handleUploadReceipt(transaction?.id)}
                      className="py-1 px-3 rounded text-xs text-white bg-primary whitespace-nowrap"
                    >
                      {t("uploadReceipt")}
                    </button>
                  ) : (
                    getStatusBadge(transaction?.payment_status)
                  )}
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {t("method")}: {transaction?.payment_gateway || "-"}
                  </span>
                  {transaction?.payment_status === "succeed" && (
                    <button
                      onClick={() => handleViewReceipt(transaction?.id)}
                      className="inline-flex items-center gap-1 py-1 px-3 border rounded text-primary hover:bg-muted transition-colors text-sm whitespace-nowrap"
                    >
                      <EyeIcon size={14} weight="bold" />
                      {t("view")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden border rounded-md">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow className="text-xs sm:text-sm">
                  <TableHead>{t("id")}</TableHead>
                  <TableHead>{t("paymentMethod")}</TableHead>
                  <TableHead>{t("transactionId")}</TableHead>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>{t("price")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("receipt")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs sm:text-sm">
                {transactions.map((transaction) => (
                  <TableRow
                    key={transaction?.id}
                    className="hover:bg-muted text-center"
                  >
                    <TableCell>{transaction?.id}</TableCell>
                    <TableCell>{transaction?.payment_gateway}</TableCell>
                    <TableCell>{transaction?.order_id}</TableCell>
                    <TableCell>
                      {formatDateMonthYear(transaction?.created_at, langCode)}
                    </TableCell>
                    <TableCell>{transaction?.amount == 0 ? t("Free") : transaction?.amount}</TableCell>
                    <TableCell>
                      {transaction?.payment_status === "pending" &&
                        transaction?.payment_gateway === "BankTransfer" ? (
                        <button
                          onClick={() => handleUploadReceipt(transaction?.id)}
                          className="py-2 px-4 rounded whitespace-nowrap text-white bg-primary"
                        >
                          {t("uploadReceipt")}
                        </button>
                      ) : (
                        getStatusBadge(transaction?.payment_status)
                      )}
                    </TableCell>
                    <TableCell>
                      {transaction?.payment_status === 'succeed' ? (
                        <button
                          onClick={() => handleViewReceipt(transaction?.id)}
                          className="inline-flex items-center gap-1 py-1 px-3 border rounded text-primary hover:bg-muted transition-colors whitespace-nowrap"
                        >
                          <EyeIcon size={14} weight="bold" />
                          {t("view")}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end items-center mb-2">
            <Pagination
              className="mt-7"
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <NoData title={t("noTransactionFound")} />
      )}
      <UploadReceiptModal
        key={IsUploadRecipt}
        IsUploadRecipt={IsUploadRecipt}
        setIsUploadRecipt={setIsUploadRecipt}
        transactionId={transactionId}
        setData={setTransactions}
      />
      <ViewReceiptModal
        isOpen={isReceiptModalOpen}
        onOpenChange={setIsReceiptModalOpen}
        transactionId={transactionId}
      />
    </>
  );
};
export default Transactions;
