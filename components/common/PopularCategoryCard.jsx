import CustomLink from "@/components/common/CustomLink";
import CustomImage from "@/components/common/CustomImage";
import { useUpdateLocationInUrl } from "@/hooks/useUpdateLocationInUrl";

const PopularCategoryCard = ({ item, useHeaderLocation = true, slugPrefix, cityData, kmRange }) => {

  // cityData/kmRange passed down when this renders as part of a server-fetched
  // Suspense section (PopularCategoriesSection) — see useUpdateLocationInUrl's
  // overrides param for why a client cookie read would hydration-mismatch here.
  const { generateAdsUrl } = useUpdateLocationInUrl({ cityData, kmRange });
  const fullSlug = slugPrefix ? `${slugPrefix}/${item?.slug}` : item?.slug;

  return (
    <CustomLink
      href={generateAdsUrl({ category: fullSlug }, useHeaderLocation)}
      className="flex flex-col gap-4"
    >
      <div className="border rounded-full">
        <CustomImage
          src={item?.image}
          width={96}
          height={96}
          className="aspect-square w-full rounded-full object-contain bg-muted"
          alt={item?.translated_name || "Category"}
          loading="eager"
        />
      </div>

      <p className="text-sm sm:text-base line-clamp-2 font-medium text-center leading-tight">
        {item?.translated_name}
      </p>
    </CustomLink>
  );
};

export default PopularCategoryCard;
