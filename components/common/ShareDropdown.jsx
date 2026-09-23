"use client";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "react-share";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState } from "react";
import { getIsRtl } from "@/store/slices/languageSlice";
import { useSelector } from "react-redux";
import { LinkIcon, ShareNetworkIcon } from "@phosphor-icons/react";
import facebookLogo from '@/public/assets/facebook_logo.svg'
import whatsappLogo from '@/public/assets/whatsapp_logo.svg'
import xLogo from '@/public/assets/x_logo.svg'
import CustomImage from "./CustomImage";
import { useTranslation } from "@/lang/useTranslation";

const ShareDropdown = ({ url, title, headline, companyName, className }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const isRTL = useSelector(getIsRtl);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("copyToClipboard"));
      setOpen(false);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  const handleShare = () => {
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className={className}>
          <ShareNetworkIcon className="size-4 sm:size-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? "start" : "end"} className='w-fit' >
        <DropdownMenuItem>
          <FacebookShareButton
            url={url}
            hashtag={title}
            onClick={handleShare}
          >
            <div className="flex items-center gap-2">
              <CustomImage src={facebookLogo} alt="Facebook" width={24} height={24} className='size-6 aspect-square rounded-full' />
              <span>{t("facebook")}</span>
            </div>
          </FacebookShareButton>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <TwitterShareButton
            url={url}
            title={headline}
            onClick={handleShare}
          >
            <div className="flex items-center gap-2">
              <CustomImage src={xLogo} alt="Twitter" width={24} height={24} className='size-6 aspect-square rounded-full' />
              <span>X</span>
            </div>
          </TwitterShareButton>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <WhatsappShareButton
            url={url}
            title={headline}
            hashtag={companyName}
            onClick={handleShare}
          >
            <div className="flex items-center gap-2">
              <CustomImage src={whatsappLogo} alt="Whatsapp" width={24} height={24} className='size-6 aspect-square rounded-full' />
              <span>{t("whatsapp")}</span>
            </div>
          </WhatsappShareButton>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <button
            className="flex items-center gap-2 w-full"
            onClick={handleCopyUrl}
          >
            <LinkIcon className="size-6!" />
            <span>{t("copyLink")}</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareDropdown;
