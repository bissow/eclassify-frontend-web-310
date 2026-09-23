"use client";
import { useTranslation } from "@/lang/useTranslation";
import CustomLink from "@/components/common/CustomLink";
import AdCard from "@/components/common/AdCard";
import { Fragment, useState } from "react";
import { useUpdateLocationInUrl } from "@/hooks/useUpdateLocationInUrl";
import SectionBanners from "@/components/custom-banners/SectionBanners";

const FeaturedSections = ({ initialFeaturedData, bannerMap, cityData, kmRange }) => {
  const { t } = useTranslation();
  const [featuredData, setFeaturedData] = useState(initialFeaturedData);

  // Server-read cityData/kmRange passed down instead of a client cookie read —
  // this component renders CustomLink hrefs during the initial server render,
  // so reading document.cookie directly here would cause a hydration
  // mismatch (see useUpdateLocationInUrl.jsx's overrides param).
  const { generateAdsUrl } = useUpdateLocationInUrl({ cityData, kmRange });

  const handleLike = (id, liked) => {
    setFeaturedData((prev) =>
      prev.map((section) => ({
        ...section,
        section_data: section.section_data.map((item) =>
          item.id === id ? { ...item, is_liked: liked } : item
        ),
      }))
    );
  };

  const getFeaturedSectionUrl = (ele) => {
    const urlWithLocation = generateAdsUrl({}, true);
    const qs = urlWithLocation.includes("?") ? urlWithLocation.split("?")[1] : "";
    return `/ads/featured/${ele?.slug}${qs ? `?${qs}` : ""}`;
  };

  return (
    featuredData &&
    featuredData.length > 0 && (
      <section>
        {featuredData.map(
          (ele) => {
            return (
              <Fragment key={ele?.id}>
                {
                  ele?.section_data.length > 0 &&
                  <>
                    <SectionBanners banners={bannerMap?.["feature_" + ele.id + "_above"]} className="mt-6 sm:mt-12" />
                    <div className="space-between gap-2 mt-12">
                      <h5 className="text-xl sm:text-2xl font-medium">
                        {ele?.translated_name || ele?.title}
                      </h5>
                      {ele?.total_data > 5 && (
                        <CustomLink
                          href={getFeaturedSectionUrl(ele)}
                          className="text-sm sm:text-base font-medium whitespace-nowrap"
                          prefetch={false}
                        >
                          {t("viewAll")}
                        </CustomLink>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mt-6 2xl:grid-cols-5">
                      {ele?.section_data.slice(0, 5).map((data) => (
                        <AdCard
                          key={data?.id}
                          item={data}
                          handleLike={handleLike}
                        />
                      ))}
                    </div>
                    <SectionBanners banners={bannerMap?.["feature_" + ele.id + "_below"]} className="mt-6 sm:mt-12" />
                  </>
                }
              </Fragment>
            )
          }
        )}
      </section>
    )
  );
};

export default FeaturedSections;
