"use client";
import { useTranslation } from "@/lang/useTranslation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import LocationTree from "@/features/filter/LocationTree";
import BudgetFilter from "@/features/filter/BudgetFilter";
import DatePostedFilter from "@/features/filter/DatePostedFilter";
import ExtraDetailsFilter from "@/features/filter/ExtraDetailsFilter";
import { cn } from "@/lib/utils";
import { useAdsFilters } from "@/features/filter/hooks/useAdsFilters";

const Filter = ({ customFields }) => {
  const { t } = useTranslation();
  // Built here rather than taken as a prop: URLSearchParams isn't serializable
  // across the server/client boundary, and the server shell renders this.
  const { initialExtraDetails, searchParams } = useAdsFilters();
  const newSearchParams = new URLSearchParams(searchParams);
  const isShowCustomfieldFilter =
    customFields &&
    customFields.length > 0 &&
    customFields.some(
      (field) =>
        field.type === "checkbox" ||
        field.type === "radio" ||
        field.type === "dropdown"
    );

  return (
    <div className="w-full border rounded-lg overflow-hidden">
      <div className="px-4 py-2 font-semibold border-b text-xl">
        {t("filters")}
      </div>
      <div className=" flex flex-col ">
        <Accordion
          type="multiple"
          // defaultValue={["category"]}
          className="w-full"
        >
          <AccordionItem value="location" className="border-b">
            <AccordionTrigger className="p-4">
              <span className="font-semibold text-base">{t("location")}</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <LocationTree />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="budget" className="border-b">
            <AccordionTrigger className="p-4">
              <span className="font-semibold text-base">{t("budget")}</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <BudgetFilter />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="date-posted" className={cn(!isShowCustomfieldFilter && 'border-0')} >
            <AccordionTrigger className="p-4">
              <span className="font-semibold text-base">{t("datePosted")}</span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <DatePostedFilter />
            </AccordionContent>
          </AccordionItem>
          {isShowCustomfieldFilter && (
            <AccordionItem value="extra-details" className='border-0' >
              <AccordionTrigger className="p-4">
                <span className="font-semibold text-base">
                  {t("extradetails")}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ExtraDetailsFilter
                  key={JSON.stringify(initialExtraDetails)}
                  customFields={customFields}
                  newSearchParams={newSearchParams}
                />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </div>
  );
};

export default Filter;
