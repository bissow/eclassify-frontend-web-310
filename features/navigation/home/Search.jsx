"use client";
import { CaretUpDownIcon, CheckIcon, CircleNotchIcon, MagnifyingGlassIcon, PlanetIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useNavigate } from "@/hooks/useNavigate";
import useGetCategories from "@/components/layout/useGetCategories";
import { useUpdateLocationInUrl } from "@/hooks/useUpdateLocationInUrl";
import { knownParams } from "@/lib/constants";
import { useTranslation } from "@/lang/useTranslation";

const Search = () => {
  const {
    cateData,
    getCategories,
    isCatLoadMore,
    catLastPage,
    catCurrentPage,
  } = useGetCategories();
  const { t } = useTranslation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const { navigate } = useNavigate();
  const { categorySlug } = useParams();
  const currentCategoryPath = categorySlug ? categorySlug.join("/") : "";
  const categoryList = [
    { slug: "all-categories", translated_name: t("allCategories") },
    ...cateData,
  ];
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(categorySlug?.[0] || "all-categories");
  const selectedItem = categoryList.find((item) => item.slug === value);
  const hasMore = catCurrentPage < catLastPage;
  const { ref, inView } = useInView();
  const [searchQuery, setSearchQuery] = useState(query);
  const { generateAdsUrl } = useUpdateLocationInUrl();


  useEffect(() => {
    if (open && inView && hasMore && !isCatLoadMore) {
      getCategories(catCurrentPage + 1);
    }
  }, [hasMore, inView, isCatLoadMore, open]);

  const handleSearchNav = (e) => {
    e.preventDefault();
    const isFeaturedPage = pathname.includes("/ads/featured/");
    const isAdsPage = pathname.includes("/ads") && !isFeaturedPage;
    const selectedSlug = selectedItem?.slug === "all-categories" ? "" : (selectedItem?.slug || "");

    const stayOnCurrentPage =
      (isFeaturedPage && !selectedSlug) ||
      (isAdsPage && selectedSlug === currentCategoryPath);

    if (stayOnCurrentPage) {
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (knownParams.includes(key)) params.set(key, value);
      });
      if (searchQuery) params.set("query", searchQuery);
      else params.delete("query");
      // real navigation: /ads listing is server-rendered from the query string
      navigate(
        `/ads${currentCategoryPath ? `/${currentCategoryPath}` : ""}?${params.toString()}`,
        { scroll: false }
      );
    } else {
      navigate(generateAdsUrl({ query: searchQuery, category: selectedItem?.slug }, !isAdsPage));
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="min-w-31.25 max-w-31.25 sm:min-w-39 sm:max-w-39 py-1 px-1.5 sm:py-2 sm:px-3 justify-between border-none hover:bg-transparent font-normal"
          >
            <span className="truncate">
              {selectedItem?.translated_name || t("selectCat")}
            </span>
            <CaretUpDownIcon className='text-muted-foreground' />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-50 p-0">
          <Command>
            <CommandInput placeholder={t("searchACategory")} />
            <CommandList>
              <CommandEmpty>{t("noCategoryFound")}</CommandEmpty>
              <CommandGroup>
                {categoryList.map((category, index) => {
                  const isLast = open && index === categoryList.length - 1;
                  return (
                    <CommandItem
                      key={category?.slug}
                      value={category?.slug}
                      onSelect={(currentValue) => {
                        setValue(currentValue);
                        setOpen(false);
                      }}
                      ref={isLast ? ref : null}
                      className='wrap-break-word'
                    >
                      {category.translated_name || category?.name}
                      <CheckIcon className={cn(
                        "ml-auto",
                        value === category.slug ? "opacity-100" : "opacity-0"
                      )}
                        weight="bold"
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {isCatLoadMore && (
                <div className="flex justify-center items-center pb-2 text-muted-foreground">
                  <CircleNotchIcon className="animate-spin" weight="bold" />
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <form
        onSubmit={handleSearchNav}
        className="w-full flex items-center gap-2 ltr:border-l rtl:border-r py-1 px-1.5 sm:py-2 sm:px-3"
      >
        <PlanetIcon className="size-4 text-muted-foreground shrink-0" weight="bold" />
        <input
          type="text"
          placeholder={t("searchAd")}
          className="text-sm outline-hidden w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="flex items-center gap-2 bg-primary text-white p-2 rounded"
          type="submit"
        >
          <MagnifyingGlassIcon size={14} weight="bold" />
        </button>
      </form>
    </>
  );
};

export default Search;
