import AdsGrid from "@/features/ads/AdsGrid";
import { getAdsItems, paramsKey } from "@/features/ads/lib/adsData";
import { toQueryString } from "@/lib/utils";

// Streams inside its own Suspense boundary so the page shell — breadcrumb,
// filters, banners, toolbar — renders immediately and only the cards wait.
// listParams is derived by AdsShell so the boundary key and this fetch can
// never come from two separate derivations.
const AdsListingSection = async ({ langCode, listParams }) => {
  
  const json = await getAdsItems({ langCode, query: toQueryString(listParams) });
  const currentPage = json?.data?.current_page || 1;

  return (
    <AdsGrid
      // Remount when the filter set changes — otherwise React keeps the old
      // instance and useState(initial*) never re-seeds from the new server data.
      key={paramsKey(listParams)}
      listParams={listParams}
      initialItems={json?.data?.data || []}
      initialCurrentPage={currentPage}
      initialHasMore={currentPage < (json?.data?.last_page || 1)}
    />
  );
};

export default AdsListingSection;
