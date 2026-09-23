import { useTranslation } from "@/lang/useTranslation";
import { PlanetIcon, TrashIcon } from "@phosphor-icons/react";

// The bar above every chat list: a search box, swapped for a selection summary
// while select mode is on.
const ChatListToolbar = ({
  selectMode,
  selectedCount,
  onCancelSelect,
  onDeleteClick,
  search,
  onSearchChange,
}) => {
  const { t } = useTranslation();
  return (
  <div className="p-4">
    {selectMode ? (
      <div className="flex items-center justify-between">
        <button onClick={onCancelSelect} className="text-sm text-muted-foreground">
          {t("cancel")}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {selectedCount} {t("selected")}
          </span>
          <button
            onClick={onDeleteClick}
            disabled={selectedCount === 0}
            className="text-destructive disabled:opacity-40"
          >
            <TrashIcon size={18} weight="bold" />
          </button>
        </div>
      </div>
    ) : (
      <div className="flex items-center gap-3 bg-muted px-4 py-2.5 rounded-lg">
        <PlanetIcon className="size-5 text-muted-foreground shrink-0" weight="bold" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchChatsProductsOrBuyers")}
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
      </div>
    )}
  </div>
  );
};

export default ChatListToolbar;
