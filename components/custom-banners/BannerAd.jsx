import { memo } from "react";
import CustomImage from "@/components/common/CustomImage";
import CustomLink from "@/components/common/CustomLink";

const getHref = (banner) => {
  switch (banner.ad_type) {
    case "advertisement":
      return `/ad-details/${banner.advertisement?.slug}`;
    case "category":
      return banner.category?.path;
    default:
      return null;
  }
};

const LAYOUT = {
  single: { w: 1512, h: 350, aspect: "aspect-1512/350" },
  dual: { w: 741, h: 220, aspect: "aspect-741/220" },
  ad_side: { w: 353, h: 450, aspect: "aspect-353/450" },
  detail_side: { w: 484, h: 617, aspect: "aspect-[484/617]" },
};

const getLayoutKey = (banner) => {
  if (banner.layout === "single_side" || banner.layout === "dual_side")
    return banner.detail_page_section ? "detail_side" : "ad_side";
  return banner.layout;
};

const BannerAd = ({ banner, isPriority = false }) => {
  if (!banner?.status) return null;

  const isExternal = banner.ad_type === "external_link";
  const href = isExternal ? banner.link : getHref(banner);
  const layout = LAYOUT[getLayoutKey(banner)] ?? LAYOUT.single;

  const image = (
    <CustomImage
      src={banner.image}
      alt={banner.title || "banner"}
      width={layout.w}
      height={layout.h}
      className={`w-full object-contain rounded-lg ${layout.aspect}`}
      {...(isPriority && {
        loading: "eager",
        fetchPriority: "high",
        sizes: "100vw",
      })}
    />
  );

  if (!href) return <div>{image}</div>;

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {image}
      </a>
    );
  }

  return <CustomLink href={href}>{image}</CustomLink>;
};

export default memo(BannerAd);
