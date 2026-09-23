"use client";
import CustomLink from "@/components/common/CustomLink";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lang/useTranslation";
import { CaretRightIcon } from "@phosphor-icons/react";

const PopularBlogCategories = ({ categories = [], isLoading = false }) => {
    const { t } = useTranslation();
    if (!isLoading && !categories.length) return null;

    return (
        <div className="flex flex-col border rounded-lg">
            <div className="p-4">
                <p className="font-bold">{t("popularCategory")}</p>
            </div>
            <div className="border-b w-full" />
            <div className="flex flex-col">
                {isLoading ? (
                    <div className="flex flex-col gap-3 p-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between py-1">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 p-4">
                        {categories.map((cat) => (
                            <CustomLink
                                key={cat?.id}
                                href={`/blogs/category/${cat?.slug}`}
                                className="flex items-center justify-between px-2 py-1.5 rounded-md text-sm hover:bg-primary/10 transition-colors"
                            >
                                <span>{cat?.translated_name}</span>
                                <CaretRightIcon size={14} weight="bold" className="shrink-0 text-muted-foreground" />
                            </CustomLink>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PopularBlogCategories;
