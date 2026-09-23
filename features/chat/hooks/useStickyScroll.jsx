import { useLayoutEffect, useRef } from "react";

// Scrolls to bottom when the last message id changes. Keyed on id, not
// length, so prepending older messages is a no-op.
const useStickyScroll = (ready, lastMessageId) => {
  const scrollRef = useRef(null);

  useLayoutEffect(() => {
    if (!scrollRef.current || !ready) return;
    // rAF over an immediate snap: on a cold load, layout may not be settled yet here.
    const raf = requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
    return () => cancelAnimationFrame(raf);
  }, [ready, lastMessageId]);

  return { scrollRef };
};

export default useStickyScroll;
