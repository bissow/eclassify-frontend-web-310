"use client";
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
import JobApplicationSkeleton from "@/features/job-applications/JobApplicationSkeleton";
import { toast } from "sonner";
import Pagination from "@/components/common/Pagination";
import { getMyJobApplicationsList } from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";

const JobApplications = () => {
  const { t } = useTranslation();
  const { lang: langCode } = useParams();

  const [jobApplication, setJobApplication] = useState({
    data: [],
    currentPage: 1,
    totalItems: 0,
    perPage: 15,
    totalPages: 0,
    isLoading: false,
  });

  useEffect(() => {
    fetchJobApplicationsData(jobApplication?.currentPage);
  }, [jobApplication?.currentPage, langCode]);


  const fetchJobApplicationsData = async (page) => {
    try {
      if (page === 1) {
        setJobApplication((prev) => ({ ...prev, isLoading: true }));
      }
      const response = await getMyJobApplicationsList.getMyJobApplications({
        page,
      });
      if (response.data.error === false) {
        setJobApplication((prev) => ({
          ...prev,
          data: response?.data?.data?.data,
          totalItems: response?.data?.data?.total,
          perPage: response?.data?.data?.per_page,
          totalPages: response?.data?.data?.last_page,
          currentPage: response?.data?.data?.current_page,
        }));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setJobApplication((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handlePageChange = (page) => {
    setJobApplication((prev) => ({ ...prev, currentPage: page }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">{t("pending")}</Badge>;
      case "accepted":
        return <Badge className="bg-green-600">{t("accepted")}</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">{t("rejected")}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      {jobApplication?.isLoading ? (
        <JobApplicationSkeleton />
      ) : jobApplication?.data?.length > 0 ? (
        <>
          {/* Mobile/Tablet cards */}
          <div className="flex flex-col gap-4 mt-2 md:hidden">
            {jobApplication?.data?.map((application) => (
              <div
                key={application.id}
                className="border rounded-xl px-4 py-2 flex flex-col gap-3 bg-white"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <h3>
                      {application.item?.translated_name || "-"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {application.recruiter?.name || "-"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDateMonthYear(application.created_at, langCode)}
                  </span>
                </div>

                <div className="border-t pt-2 flex justify-between items-center">
                  {getStatusBadge(application.status || "pending")}
                  {application.resume ? (
                    <Link
                      href={application.resume}
                      target="_blank"
                      className="bg-primary text-white px-2 py-1 rounded text-sm"
                      rel="noopener noreferrer"
                    >
                      {t("viewResume")}
                    </Link>
                  ) : (
                    <button className="bg-muted text-muted-foreground px-2 py-1 rounded text-sm cursor-default">
                      {t("resumeNotAvailable")}
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
                  <TableHead>{t("jobTitle")}</TableHead>
                  <TableHead>{t("recruiter")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead>{t("appliedDate")}</TableHead>
                  <TableHead>{t("resume")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs sm:text-sm">
                {jobApplication?.data?.map((application) => (
                  <TableRow
                    key={application?.id}
                    className="hover:bg-muted text-center"
                  >
                    <TableCell>{application.item?.translated_name || "-"}</TableCell>
                    <TableCell>{application.recruiter?.name || "-"}</TableCell>
                    <TableCell>
                      {getStatusBadge(application.status || "Pending")}
                    </TableCell>
                    <TableCell>
                      {formatDateMonthYear(application.created_at, langCode)}
                    </TableCell>
                    <TableCell>
                      {application?.resume ? (
                        <Link
                          href={application?.resume}
                          target="_blank"
                          className="text-primary underline font-medium"
                          rel="noopener noreferrer"
                        >
                          {t("viewResume")}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground italic text-sm">
                          {t("notAvailable")}
                        </span>
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
              currentPage={jobApplication?.currentPage}
              totalPages={jobApplication?.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        <NoData title={t("noJobApplicationsFound")} />
      )}
    </>
  );
};

export default JobApplications;
