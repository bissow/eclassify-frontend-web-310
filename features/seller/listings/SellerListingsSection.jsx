import { getSellerItems } from "@/features/seller/lib/sellerData";
import SellerListings from "@/features/seller/listings/SellerListings";

const SellerListingsSection = async ({ id, langCode, sortBy }) => {
  const items = await getSellerItems({ id, langCode, sortBy });
  const currentPage = items?.current_page || 1;

  return (
    <SellerListings
      // Remount on sort change — otherwise React keeps the old instance and
      // useState(initial*) never re-seeds from the new server data.
      key={sortBy}
      id={id}
      initialItems={items?.data || []}
      initialCurrentPage={currentPage}
      initialHasMore={currentPage < (items?.last_page || 1)}
    />
  );
};

export default SellerListingsSection;
