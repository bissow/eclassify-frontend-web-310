import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import { useTranslation } from "@/lang/useTranslation";
import { extractYear, getDefaultCountryCode } from "@/lib/format";
import CustomLink from "@/components/common/CustomLink";
import { chatListApi, itemOfferApi } from "@/lib/api";
import { toast } from "sonner";
import { userSignUpData } from "@/store/slices/authSlice";
import { getIsRtl } from "@/store/slices/languageSlice";
import MakeOfferModal from "@/features/ad-details/MakeOfferModal";
import { setIsLoginOpen } from "@/store/slices/globalStateSlice";
import ApplyJobModal from "@/features/ad-details/jobs/ApplyJobModal";
import UserAvatar from "@/components/common/UserAvatar";
import Link from "next/link";
import { useNavigate } from "@/hooks/useNavigate";
import { ArrowRightIcon, CaretDownIcon, ChatTeardropDotsIcon, GiftIcon, PaperPlaneTiltIcon, PhoneCallIcon, ShieldCheckIcon, StarIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const SellerDetailCard = ({ productDetails, setProductDetails }) => {

  const { t } = useTranslation();
  const { navigate } = useNavigate();
  const userData = productDetails && productDetails?.user;
  const memberSinceYear = userData?.created_at
    ? extractYear(userData.created_at)
    : "";
  const [IsStartingChat, setIsStartingChat] = useState(false);
  const isRTL = useSelector(getIsRtl);
  const loggedInUser = useSelector(userSignUpData);
  const loggedInUserId = loggedInUser?.id;
  const [IsOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showNumber, setShowNumber] = useState(false);

  const isAllowedToMakeOffer = Number(productDetails?.category?.is_job_category) === 0 && Number(productDetails?.price) > 0 && !productDetails?.is_already_offered

  const isJobCategory = Number(productDetails?.category?.is_job_category) === 1;
  const isApplied = productDetails?.is_already_job_applied;
  const item_id = productDetails?.id;

  const handleOfferSuccess = (offer) => {
    navigate("/chat?activeTab=buying&chatid=" + offer?.id + '&chat_ad_id=' + productDetails?.id);
  };

  const handleChat = async () => {
    if (!loggedInUserId) {
      setIsLoginOpen(true);
      return;
    }
    try {
      setIsStartingChat(true);
      const isAlreadyOffered = productDetails?.is_already_offered;
      if (isAlreadyOffered) {
        const item_offer_id = productDetails?.item_offers?.[0]?.id;
        const response = await chatListApi.chatList({ type: "buyer", item_offer_id });
        if (response?.data?.error === false) {
          const chatId = response?.data?.data?.data[0]?.id;
          const adId = response?.data?.data?.data[0]?.item?.id;
          navigate("/chat?activeTab=buying&chatid=" + chatId + '&chat_ad_id=' + adId);
        } else {
          toast.error(response?.data?.message);
        }
      } else {
        const response = await itemOfferApi.offer({
          item_id: productDetails?.id,
        });
        if (response?.data?.error === false) {
          const { data } = response.data;
          navigate("/chat?activeTab=buying&chatid=" + data?.id + '&chat_ad_id=' + productDetails?.id);
        } else {
          toast.error(response?.data?.message);
        }
      }
    } catch (error) {
      toast.error(t("unableToStartChat"));
      console.log(error);
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleMakeOffer = () => {
    if (!loggedInUserId) {
      setIsLoginOpen(true);
      return;
    }
    setIsOfferModalOpen(true);
  };

  const handleApplyJob = () => {
    if (!loggedInUserId) {
      setIsLoginOpen(true);
      return;
    }
    setShowApplyModal(true);
  };


  const contactNumber = productDetails?.contact;

  const regionCode = productDetails?.region_code?.toUpperCase();
  const countryCode = getDefaultCountryCode(regionCode) || "";

  const prefix = countryCode ? `+${countryCode}` : "";
  const mobile = contactNumber ? `${prefix}${contactNumber}` : null;
  const whatsappUrl = mobile
    ? `https://wa.me/${countryCode}${contactNumber.replace(/\D/g, "")}`
    : null;

  return (
    <>
      <div className="flex items-center rounded-lg border flex-col">
        {(productDetails?.user?.is_verified == 1 || memberSinceYear) && (
          <>
            <div className="p-4 flex justify-between items-center w-full">
              {productDetails?.user?.is_verified == 1 && (
                <Badge
                  variant="outline"
                  className="p-1 bg-[#FA6E53] flex items-center gap-1 rounded-md text-white text-sm"
                >
                  <ShieldCheckIcon size={20} weight="fill" />
                  {t("verified")}
                </Badge>
              )}
              {memberSinceYear && (
                <p className="ltr:ml-auto rtl:mr-auto text-sm text-muted-foreground">
                  {t("memberSince")}: {memberSinceYear}
                </p>
              )}
            </div>
            <div className="border-b w-full"></div>
          </>
        )}

        <div className="flex gap-2 justify-between w-full items-center p-4">
          <div className="flex gap-2.5 items-center max-w-[90%]">
            <UserAvatar
              onClick={() => navigate(`/seller/${productDetails?.user?.id}`)}
              src={productDetails?.user?.profile}
              initial={productDetails?.user?.initial}
              avatarColor={productDetails?.user?.avatar_color}
              alt="Seller Image"
              size={80}
              className="w-20 h-20 rounded-lg cursor-pointer"
            />
            <div className="flex flex-col gap-1 min-w-0">
              <CustomLink
                href={`/seller/${productDetails?.user?.id}`}
                className="font-bold text-lg truncate"
              >
                {productDetails?.user?.name}
              </CustomLink>
              {productDetails?.user?.average_rating && (
                <div className="flex items-center gap-1 text-sm">
                  <StarIcon size={16} className="text-black" weight="fill" />
                  <p className="flex">
                    {Number(productDetails?.user?.average_rating).toFixed(1)}
                  </p>{" "}
                  |{" "}
                  <p className="flex text-sm ">
                    {productDetails?.user?.reviews_count}
                  </p>{" "}
                  {t("ratings")}
                </div>
              )}
              {productDetails?.user?.show_personal_details == 1 &&
                productDetails?.user?.email && (
                  <Link
                    href={`mailto:${productDetails?.user?.email}`}
                    className="text-sm truncate"
                  >
                    {productDetails?.user?.email}
                  </Link>
                )}
            </div>
          </div>
          <CustomLink href={`/seller/${productDetails?.user?.id}`}>
            <ArrowRightIcon size={20} className="text-black rtl:scale-x-[-1]" />
          </CustomLink>
        </div>
        <div className="border-b w-full"></div>
        <div className="flex flex-wrap items-center gap-4 p-4 w-full">
          <button
            onClick={handleChat}
            disabled={IsStartingChat}
            className="bg-black text-white p-4 rounded-md flex items-center gap-2 text-base font-medium justify-center whitespace-nowrap flex-[1_1_47%]"
          >
            <ChatTeardropDotsIcon size={22} />
            {IsStartingChat ? (
              <span>{t("startingChat")}</span>
            ) : (
              <span>{t("startChat")}</span>
            )}
          </button>
          {/* single Contact popover with Call + WhatsApp, all screen sizes */}
          {(mobile || whatsappUrl) && (
            <Popover dir={isRTL ? "rtl" : "ltr"}>
              <PopoverTrigger asChild>
                <button className="group bg-black text-white p-4 rounded-md flex items-center gap-2 text-base font-medium justify-center whitespace-nowrap flex-[1_1_47%]">
                  <PhoneCallIcon size={21} />
                  <span>{t("contact")}</span>
                  <CaretDownIcon
                    size={16}
                    weight="bold"
                    className="transition-transform group-data-[state=open]:rotate-180"
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 flex flex-col gap-1" align="end">
                {mobile && (
                  <>
                    {/* 📱 MOBILE: direct call */}
                    <Link
                      href={`tel:${mobile}`}
                      className="lg:hidden flex items-center gap-2 p-2 rounded-md text-sm font-medium hover:bg-muted"
                    >
                      <PhoneCallIcon size={20} />
                      <span>{t("call")}</span>
                    </Link>

                    {/* 💻 DESKTOP: reveal/hide number toggle */}
                    <button
                      onClick={() => setShowNumber((prev) => !prev)}
                      className="hidden lg:flex items-center gap-2 p-2 rounded-md text-sm font-medium hover:bg-muted"
                    >
                      <PhoneCallIcon size={20} />
                      <span>{showNumber ? mobile : t("showMobileNumber")}</span>
                    </button>

                    {/* 📱 MOBILE: opens native SMS app */}
                    <Link
                      href={`sms:${mobile}`}
                      className="lg:hidden flex items-center gap-2 p-2 rounded-md text-sm font-medium hover:bg-muted"
                    >
                      <ChatTeardropDotsIcon size={20} />
                      <span>{t("message")}</span>
                    </Link>
                  </>
                )}
                {whatsappUrl && (
                  <Link
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-md text-sm font-medium hover:bg-muted"
                  >
                    <WhatsappLogoIcon size={20} />
                    <span>{t("whatsapp")}</span>
                  </Link>
                )}
              </PopoverContent>
            </Popover>
          )}

          {isAllowedToMakeOffer && (
            <button
              onClick={handleMakeOffer}
              className="bg-primary text-white p-4 rounded-md flex items-center gap-2 text-base font-medium justify-center whitespace-nowrap flex-[1_1_47%]"
            >
              <GiftIcon size={21} />
              {t("makeOffer")}
            </button>
          )}
          {isJobCategory && (
            <button
              className={`text-white p-4 rounded-md flex items-center gap-2 text-base font-medium justify-center whitespace-nowrap flex-[1_1_47%] ${isApplied ? "bg-primary" : "bg-black"
                }`}
              disabled={isApplied}
              onClick={handleApplyJob}
            >
              <PaperPlaneTiltIcon size={20} />
              {isApplied ? t("applied") : t("applyNow")}
            </button>
          )}
        </div>
      </div>

      <MakeOfferModal
        isOpen={IsOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSuccess={handleOfferSuccess}
        itemId={productDetails?.id}
        price={productDetails?.price}
        currency={productDetails?.currency}
        formattedPrice={productDetails?.formatted_price}
        key={`offer-modal-${IsOfferModalOpen}`}
      />
      <ApplyJobModal
        key={`apply-job-modal-${showApplyModal}`}
        showApplyModal={showApplyModal}
        setShowApplyModal={setShowApplyModal}
        item_id={item_id}
        setProductDetails={setProductDetails}
      />
    </>
  );
};

export default SellerDetailCard;
