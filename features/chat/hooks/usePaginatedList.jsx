import { useState } from "react";

const EMPTY = { list: [], total: 0, currentPage: 1, hasMore: false, isLoading: true, isLoadMore: false };

// One paginated + searchable list, owned locally (the selling-ads list). The
// sidebar chat list lives in the store instead — too many writers.
// Search term sits next to the page cursor so a scroll handler can't page with
// a stale term. patchList is exposed for optimistic live updates.
const usePaginatedList = (fetcher) => {
  const [data, setData] = useState(EMPTY);
  const [search, setSearch] = useState("");

  const load = async (page = 1, term = "") => {
    setData((p) => ({ ...p, isLoading: page === 1, isLoadMore: page > 1 }));
    try {
      const res = await fetcher({ page, search: term });
      const d = res?.data?.data ?? {};
      const rows = d.data ?? [];
      setData((p) => ({
        list: page === 1 ? rows : [...p.list, ...rows],
        total: Number(d.total) || 0,
        currentPage: Number(d.current_page) || page,
        hasMore: Number(d.current_page) < Number(d.last_page),
        isLoading: false,
        isLoadMore: false,
      }));
    } catch (err) {
      console.error(err);
      setData((p) => ({ ...p, isLoading: false, isLoadMore: false }));
    }
  };

  return { ...data, search, setSearch, load, patchList: setData };
};

export default usePaginatedList;
