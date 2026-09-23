import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/lang/useTranslation";
import { useState } from "react";
import { BriefcaseIcon, PlayCircleIcon, XIcon } from "@phosphor-icons/react";
import { useNavigate } from "@/hooks/useNavigate";

const SelectAdTypeModal = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState("regular");
  const { navigate } = useNavigate();

  const handleNext = () => {
    onClose();
    navigate(selected === "video" ? "/ad-listing?type=video" : "/ad-listing");
  };

  const handleClose = () => {
    setSelected("regular");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full! max-w-200 sm:max-w-200 [&>button]:hidden p-0! overflow-hidden border-none shadow-2xl">
        <DialogTitle className="sr-only">{t("selectAdsType")}</DialogTitle>
        <DialogDescription className="sr-only">{t("selectAdsType")}</DialogDescription>

        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b">
          <h3 className="font-semibold text-lg text-gray-800">{t("selectAdsType")}</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <XIcon size={20} className="text-muted-foreground" weight="bold" />
          </button>
        </div>

        {/* Options */}
        <div className="py-4 px-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          {/* Regular Ad Listing */}
          <button
            onClick={() => setSelected("regular")}
            className={`gap-4 group flex flex-col items-center justify-center p-3 border rounded-xl text-center transition-all duration-200 ${selected === "regular"
              ? "border-primary"
              : "border-border hover:border-primary/40"
              }`}
          >
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
              <BriefcaseIcon className="size-8 text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-medium">{t("regularAdListing")}</h4>
              <p className="text-sm text-muted-foreground">{t("regularAdListingDesc")}</p>
            </div>
          </button>

          {/* Video Ad Listing */}
          <button
            onClick={() => setSelected("video")}
            className={`gap-4 group flex flex-col items-center justify-center p-3 border rounded-xl text-center transition-all duration-200 ${selected === "video"
              ? "border-primary"
              : "border-border hover:border-primary/40"
              }`}
          >
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
              <PlayCircleIcon className="size-8 text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold">{t("videoAdListing")}</h4>
              <p className="text-sm text-muted-foreground">{t("videoAdListingDesc")}</p>
            </div>
          </button>

          <div />
          <p className="text-sm text-primary">
            {t("videoAdsVisibility")}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 pb-6">
          <Button onClick={handleNext} className='text-lg' >
            {t("next")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SelectAdTypeModal;
