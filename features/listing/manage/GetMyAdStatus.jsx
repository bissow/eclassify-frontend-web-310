import { useTranslation } from "@/lang/useTranslation";
import { CheckIcon, ClockIcon, HandshakeIcon, MonitorPlayIcon, ProhibitIcon, SealCheckIcon, TimerIcon, XCircleIcon, XIcon } from "@phosphor-icons/react";

const GetMyAdStatus = ({
  status,
  isApprovedSort = false,
  isFeature = false,
  isJobCategory = false,
}) => {
  const { t } = useTranslation();

  const statusComponents = {
    approved: isApprovedSort
      ? { icon: <MonitorPlayIcon size={16} color="white" weight="bold" />, text: t("live") }
      : isFeature
        ? { icon: <SealCheckIcon size={16} color="white" weight="bold" />, text: t("featured") }
        : { icon: <MonitorPlayIcon size={16} color="white" weight="bold" />, text: t("live") },

    review: {
      icon: <ClockIcon size={16} color="white" weight="bold" />,
      text: t("review"),
    },
    "permanent rejected": {
      icon: <XIcon size={16} color="white" weight="bold" />,
      text: t("permanentRejected"),
      bg: "bg-red-600",
    },
    "soft rejected": {
      icon: <XIcon size={16} color="white" weight="bold" />,
      text: t("softRejected"),
      bg: "bg-red-500",
    },
    inactive: {
      icon: <ProhibitIcon size={16} color="white" weight="bold" />,
      text: t("deactivate"),
      bg: "bg-gray-500",
    },
    "sold out": {
      icon: <HandshakeIcon size={16} color="white" />,
      text: isJobCategory ? t("positionFilled") : t("soldOut"),
      bg: "bg-yellow-600",
    },
    resubmitted: {
      icon: <CheckIcon size={16} color="white" weight='bold' />,
      text: t("resubmitted"),
      bg: "bg-green-600",
    },
    expired: {
      icon: <XCircleIcon size={16} color="white" />,
      text: t("expired"),
      bg: "bg-gray-700",
    },
  };

  const { icon, text, bg = "bg-primary" } = statusComponents[status] || {};

  if (!status) return null;

  return (
    <div className={`flex items-center gap-1 ${bg} rounded-sm py-0.5 px-1`}>
      {icon}
      <span className="text-white text-sm text-ellipsis">{text}</span>
    </div>
  );
};

export default GetMyAdStatus;
