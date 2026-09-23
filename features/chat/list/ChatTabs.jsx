import { useTranslation } from "@/lang/useTranslation";
import CustomLink from "@/components/common/CustomLink";
import { cn } from "@/lib/utils";

const TABS = ["selling", "buying"];

const ChatTabs = ({ activeTab, counts }) => {
  const { t } = useTranslation();
  return (
  <div className="flex items-center">
    {TABS.map((tab) => (
      <CustomLink
        key={tab}
        href={`/chat?activeTab=${tab}`}
        scroll={false}
        className={cn(
          "py-4 flex-1 flex items-center justify-center gap-1.5 text-center border-b",
          activeTab === tab && "border-primary text-primary"
        )}
      >
        {t(tab)}
        {counts?.[tab] > 0 && (
          <span className="flex items-center justify-center bg-primary text-white rounded-full min-w-5 h-5 px-1 text-xs">
            {counts[tab]}
          </span>
        )}
      </CustomLink>
    ))}
  </div>
  );
};

export default ChatTabs;
