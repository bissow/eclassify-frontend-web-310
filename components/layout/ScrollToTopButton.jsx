"use client";
import { cn } from "@/lib/utils";
import { CaretUpIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("scroll-sentinel");
    const observer = new IntersectionObserver(
      ([entry]) => {
        // isIntersecting means the sentinel IS visible (user is at the top)
        setIsVisible(!entry.isIntersecting);
      },
      {
        threshold: 0,
        // Optional: Don't show button until user scrolls 300px down
        rootMargin: "300px 0px 0px 0px"
      }
    );
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-7 right-7 bg-primary text-white rounded z-1000 p-2 flex items-center justify-center size-12",
        isVisible ? "flex" : "hidden"
      )}
    >
      <CaretUpIcon size={22} weight="bold" />
    </button>
  );
};

export default ScrollToTopButton;