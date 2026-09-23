import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

// Returns a sentinel ref — render <div ref={ref} /> after the last row. When the
// sentinel scrolls into view and the list has another page, onLoadMore runs.
//
// onLoadMore is deliberately not a dependency: the effect closure is rebuilt on
// every render, so the version that fires already reads the latest state (page
// cursor, search term). Listing it would only add redundant re-subscribes.
//
// `enabled` lets a component that renders more than one list keep a separate
// sentinel per list and only arm the one currently on screen.
const useInfiniteScroll = (onLoadMore, { hasMore, isLoading, enabled = true } = {}) => {
  const { ref, inView } = useInView();

  useEffect(() => {
    if (enabled && inView && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [inView, hasMore, isLoading, enabled]);

  return ref;
};

export default useInfiniteScroll;
