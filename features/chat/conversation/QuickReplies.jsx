"use client";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { StarIcon } from "@phosphor-icons/react";
import { useTranslation } from "@/lang/useTranslation";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { getMessageSelectMode } from "@/store/slices/chatSlice";

// Open state is controlled by MessageComposer; this only auto-closes it on select-mode.
const QuickReplies = ({ replies, onSelect, disabled, open, onOpenChange }) => {
  const { t } = useTranslation();
  const selectMode = useSelector(getMessageSelectMode);

  // Auto-collapse on entering message select-mode — one-way, no auto-reopen.
  useEffect(() => {
    if (selectMode) onOpenChange(false);
  }, [selectMode, onOpenChange]);

  if (!replies?.length) return null;

  return (
    <div className="px-4">
      <Accordion
        type="single"
        collapsible
        value={open ? "quick-reply" : ""}
        onValueChange={(value) => onOpenChange(value === "quick-reply")}
      >
        <AccordionItem value="quick-reply" className="border-b-0">
          <AccordionTrigger className="py-4 text-xs sm:text-sm hover:no-underline">
            <span className="flex items-center gap-1">
              <StarIcon size={15} />
              {t("quickReplay")}
            </span>
          </AccordionTrigger>
          <AccordionContent className="">
            <Carousel opts={{ dragFree: true, containScroll: "trimSnaps" }} className="w-full">
              <CarouselContent className="ml-0 gap-2">
                {replies.map((text) => (
                  <CarouselItem key={text} className="basis-auto pl-0">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelect(text)}
                      className="whitespace-nowrap text-xs sm:text-sm rounded-lg p-2 border hover:bg-muted disabled:opacity-50"
                    >
                      {text}
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default QuickReplies;
