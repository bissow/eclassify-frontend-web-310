import { authHeader, buildLocationParams, getLocationCookie } from "@/lib/server/locationCookie";
import { etagFetch } from "@/lib/server/etagFetch";
import { Skeleton } from "@/components/ui/skeleton";
import AllItems from "@/features/discovery/all-items/AllItems";
import AllItemsCardsSkeleton from "@/features/discovery/all-items/AllItemsSkeleton";

const getAllItems = async (location, langCode) => {
  try {
    const params = new URLSearchParams({
      page: "1",
      current_page: "home",
      ...buildLocationParams(location),
    });

    return await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-item-list?${params}`,
      {
        key: `all-items:${langCode || "en"}:${params.toString()}`,
        headers: { "Content-Language": langCode || "en", ...(await authHeader()) },
      }
    );
  } catch (error) {
    console.error("Error fetching all items:", error);
    return null;
  }
};

const AllItemsSection = async ({ langCode, aboveBanners, belowBanners }) => {
  const location = await getLocationCookie();
  const json = await getAllItems(location, langCode);

  const apiMessage = json?.message;
  const isNoItemsInLocation = apiMessage?.toLowerCase().includes("no ads found");
  const items = json?.data?.data || [];

  return (
    <AllItems
      // Forces a remount when location/language actually changes — without
      // it, React preserves the existing instance and its useState(initialItems)
      // never re-initializes from the fresh server-fetched props.
      key={JSON.stringify({ langCode, location })}
      initialItems={items}
      initialLocationAlertMessage={isNoItemsInLocation && items.length > 0 ? apiMessage : ""}
      initialCurrentPage={json?.data?.current_page || 1}
      initialHasMore={(json?.data?.current_page || 1) < (json?.data?.last_page || 1)}
      initialCityData={location}
      initialKmRange={Number(location?.kmRange) || 0}
      aboveBanners={aboveBanners}
      belowBanners={belowBanners}
    />
  );
};

export const AllItemsSkeleton = () => (
  <section className="mt-12">
    <Skeleton className="h-8 w-56" />
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6 mt-6">
      <AllItemsCardsSkeleton />
    </div>
  </section>
);

export default AllItemsSection;
