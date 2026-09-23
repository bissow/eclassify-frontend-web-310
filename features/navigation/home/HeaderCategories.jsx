'use client';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import CustomLink from "@/components/common/CustomLink";
import { useEffect, useRef, useState } from "react";
import CustomImage from "@/components/common/CustomImage";
import { useNavigate } from "@/hooks/useNavigate";
import { usePathname } from "next/navigation";
import { useUpdateLocationInUrl } from "@/hooks/useUpdateLocationInUrl";
import { DotsThreeIcon } from "@phosphor-icons/react";
import { useTranslation } from "@/lang/useTranslation";

const HeaderCategories = ({ cateData, cityData }) => {
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const pathname = usePathname();
  const { navigate } = useNavigate();
  const { t } = useTranslation();
  const { generateAdsUrl } = useUpdateLocationInUrl({
    cityData,
    kmRange: cityData?.kmRange,
  });

  const [fitCategoriesCount, setFitCategoriesCount] = useState(3);
  const [dropdownWidth, setDropdownWidth] = useState(0);

  useEffect(() => {
    const calculateFit = () => {
      if (!containerRef.current || !measureRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      if (containerWidth === 0) return; // hidden (mobile) — nothing to measure
      setDropdownWidth(containerWidth);
      const otherWidth = 80; //approx width of other option
      const availableWidth = containerWidth - otherWidth;

      const items = Array.from(measureRef.current.children);
      let totalWidth = 0;
      let visible = 0;

      for (const item of items) {
        const width = item.getBoundingClientRect().width + 48; // padding/gap buffer

        if (totalWidth + width > availableWidth) break;
        totalWidth += width;
        visible++;
      }

      setFitCategoriesCount(visible);
    };

    const resizeObserver = new ResizeObserver(calculateFit);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [cateData]);

  const isAdsPage = pathname.includes("/ads");

  const buildCategoryUrl = (fullSlug) => {
    return generateAdsUrl({ category: fullSlug }, !isAdsPage);
  };

  const handleCategoryClick = (slug) => {
    navigate(generateAdsUrl({ category: slug }, !isAdsPage));
  };

  const handleOtherCategoryClick = () => {
    navigate(generateAdsUrl({}, !isAdsPage));
  };

  return (
    <div className="hidden lg:block py-1.5 border-b">
      <div className="container" ref={containerRef}>
        {/* Hidden measurement row */}
        <div
          ref={measureRef}
          className="absolute opacity-0 pointer-events-none flex"
          style={{ position: "fixed", top: -9999, left: -9999 }}
        >
          {cateData.map((category) => (
            <div key={category.id} className="px-2">
              <span className="whitespace-nowrap font-medium text-sm">
                {category.translated_name}
              </span>
            </div>
          ))}
        </div>

        <NavigationMenu>
          <NavigationMenuList className="rtl:flex-row-reverse">
            {cateData?.slice(0, fitCategoriesCount)?.map((category) => (
              <NavigationMenuItem key={category.id}>
                {category.subcategories_count > 0 ? (
                  <>
                    <NavigationMenuTrigger
                      onClick={() => handleCategoryClick(category.slug)}
                    >
                      <span className="break-all">{category.translated_name}</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="rtl:[direction:rtl]">
                      <NavigationMenuLink asChild>
                        <div
                          style={{
                            width: dropdownWidth - 32,
                          }}
                          className="flex overflow-hidden"
                        >
                          <div className="w-[20%] p-4 bg-muted">
                            <div className="flex gap-1">
                              <CustomImage
                                src={category?.image}
                                alt={category?.translated_name}
                                width={24}
                                height={24}
                                className="size-6 aspect-square"
                              />
                              <p className="font-bold break-all">
                                {category?.translated_name}
                              </p>
                            </div>
                          </div>

                          <div className="w-[80%] p-4 h-[40vh] max-h-[40vh] overflow-y-auto">
                            <div className="grid grid-cols-5 gap-8">
                              {/* <CustomLink
                                href={`/ads?category=${category.slug}`}
                                className="font-semibold whitespace-nowrap text-sm hover:text-primary"
                              >
                                {t("seeAllIn")} {category.translated_name}
                              </CustomLink> */}

                              {category.subcategories.map((subcategory) => (
                                <div key={subcategory.id}>
                                  <CustomLink
                                    href={buildCategoryUrl(`${category.slug}/${subcategory.slug}`)}
                                    className="font-semibold text-sm hover:text-primary break-all"
                                  >
                                    {subcategory.translated_name}
                                  </CustomLink>

                                  {subcategory.subcategories_count > 0 && (
                                    <ul className="flex flex-col gap-2 mt-2">
                                      {subcategory?.subcategories
                                        ?.slice(0, 5)
                                        .map((nestedSubcategory) => (
                                          <li
                                            key={nestedSubcategory?.id}
                                            className="text-xs"
                                          >
                                            <CustomLink
                                              href={buildCategoryUrl(
                                                `${category.slug}/${subcategory.slug}/${nestedSubcategory?.slug}`
                                              )}
                                              className="hover:text-primary break-all"
                                            >
                                              {
                                                nestedSubcategory?.translated_name
                                              }
                                            </CustomLink>
                                          </li>
                                        ))}
                                      {subcategory.subcategories.length > 5 && (
                                        <li className="text-xs">
                                          <CustomLink
                                            href={buildCategoryUrl(
                                              `${category.slug}/${subcategory.slug}`
                                            )}
                                            className="hover:text-primary"
                                          >
                                            {t("viewAll")}
                                          </CustomLink>
                                        </li>
                                      )}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </NavigationMenuLink>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    href={buildCategoryUrl(category?.slug)}
                    asChild
                  >
                    <CustomLink href={buildCategoryUrl(category?.slug)} className="break-all">
                      {category.translated_name}
                    </CustomLink>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
            {cateData && cateData.length > fitCategoriesCount && (
              <NavigationMenuItem>
                <NavigationMenuTrigger onClick={handleOtherCategoryClick}>
                  {t("other")}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="rtl:[direction:rtl]">
                  <NavigationMenuLink asChild>
                    <div
                      style={{ width: dropdownWidth - 32 }}
                      className="flex overflow-hidden w-[80vw]"
                    >
                      <div className="w-[20%] p-4 bg-muted">
                        <div className="flex gap-1">
                          <DotsThreeIcon size={22} weight="bold" />
                          <p className="font-bold">{t("other")}</p>
                        </div>
                      </div>

                      <div className="w-[80%] p-4 h-[40vh] max-h-[40vh] overflow-y-auto">
                        <div className="grid grid-cols-5 gap-8">
                          {cateData
                            .slice(fitCategoriesCount)
                            .map((subcategory) => (
                              <div key={subcategory.id}>
                                <CustomLink
                                  href={buildCategoryUrl(subcategory.slug)}
                                  className="font-semibold text-sm hover:text-primary break-all"
                                >
                                  {subcategory.translated_name}
                                </CustomLink>

                                {subcategory.subcategories_count > 0 && (
                                  <ul className="flex flex-col gap-2 mt-2">
                                    {subcategory?.subcategories
                                      ?.slice(0, 5)
                                      .map((nestedSubcategory) => (
                                        <li
                                          key={nestedSubcategory?.id}
                                          className="text-xs"
                                        >
                                          <CustomLink
                                            href={buildCategoryUrl(
                                              `${subcategory.slug}/${nestedSubcategory?.slug}`
                                            )}
                                            className="hover:text-primary break-all"
                                          >
                                            {nestedSubcategory?.translated_name}
                                          </CustomLink>
                                        </li>
                                      ))}
                                    {subcategory.subcategories.length > 5 && (
                                      <li className="text-xs">
                                        <CustomLink
                                          href={buildCategoryUrl(
                                            subcategory.slug
                                          )}
                                          className="hover:text-primary"
                                        >
                                          {t("viewAll")}
                                        </CustomLink>
                                      </li>
                                    )}
                                  </ul>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </NavigationMenuLink>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
};

export default HeaderCategories;
