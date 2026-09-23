"use client";
import BreadCrumb from "@/components/common/BreadCrumb";
import FaqCard from "@/features/faq/FaqCard";
import NoData from "@/components/empty-states/NoData";
import { useTranslation } from "@/lang/useTranslation";

// `faqs` is fetched server-side in the route, so the list ships in the first
// byte instead of flashing "no FAQs found" until the client effect resolves.
const FaqsPage = ({ faqs = [] }) => {
  const { t } = useTranslation();
  return (
    <>
      <BreadCrumb items={[{ name: t("faqs") }]} />
      {faqs?.length > 0 ? (
        <div className="container">
          <div className="flex flex-col gap-6 mt-8">
            <h1 className="text-2xl font-semibold">{t("faqs")}</h1>
            <div className="flex flex-col gap-4 md:gap-8">
              {faqs?.map((faq) => {
                return <FaqCard faq={faq} key={faq?.id} />;
              })}
            </div>
          </div>
        </div>
      ) : (
        <NoData title={t("noFaqsFound")} />
      )}
    </>
  );
};

export default FaqsPage;
