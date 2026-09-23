"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { settingsData } from "@/store/slices/settingSlice";
import { useTranslation } from "@/lang/useTranslation";
import { useSelector } from "react-redux";
import LanguageDropdown from "@/components/common/LanguageDropdown";
import CustomImage from "@/components/common/CustomImage";
import { ListIcon } from "@phosphor-icons/react";

const LandingMobileMenu = ({ isOpen, setIsOpen, activeSection }) => {
  const { t } = useTranslation();
  const settings = useSelector(settingsData);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      setIsOpen(false);
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} className="lg:hidden">
      <SheetTrigger asChild className="lg:hidden">
        <button
          id="hamburg"
          className="text-2xl cursor-pointer border rounded-lg p-1"
        >
          <ListIcon size={25} className="text-primary" weight="bold" />
        </button>
      </SheetTrigger>
      <SheetContent className="[&>button:first-child]:hidden] p-0">
        <SheetHeader className="py-4 px-6 border-b border">
          <SheetTitle>
            <CustomImage
              src={settings?.header_logo}
              width={195}
              height={52}
              alt="Logo"
              className="w-full h-[52px] object-contain ltr:object-left rtl:object-right max-w-[195px]"
            />
          </SheetTitle>
        </SheetHeader>
        <div className="p-6">
          <div className="flex flex-col list-none">
            <li
              className={`cursor-pointer py-3 border-b border-dashed transition-all duration-200 ${activeSection === "anythingYouWant"
                ? "text-primary"
                : "hover:text-primary"
                }`}
              onClick={() => scrollToSection("anythingYouWant")}
            >
              {t("home")}
            </li>
            <li
              className={`cursor-pointer py-3 border-b border-dashed transition-all duration-200 ${activeSection === "work_process"
                ? "text-primary"
                : "hover:text-primary"
                }`}
              onClick={() => scrollToSection("work_process")}
            >
              {t("whyChooseUs")}
            </li>
            <li
              className={`cursor-pointer py-3 border-b border-dashed transition-all duration-200 ${activeSection === "faq"
                ? "text-primary font-semibold bg-primary/5"
                : "hover:text-primary"
                }`}
              onClick={() => scrollToSection("faq")}
            >
              {t("faqs")}
            </li>
            <li
              className={`cursor-pointer py-3 border-b border-dashed transition-all duration-200 ${activeSection === "ourBlogs"
                ? "text-primary font-semibold bg-primary/5"
                : "hover:text-primary"
                }`}
              onClick={() => scrollToSection("ourBlogs")}
            >
              {t("blog")}
            </li>
            <li className="py-3">
              <LanguageDropdown />
            </li>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LandingMobileMenu;
