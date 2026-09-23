"use client";
import CustomLink from "@/components/common/CustomLink";
import { useTranslation } from "@/lang/useTranslation";
import { getBlogCategoriesApi } from "@/lib/api";
import { CaretRightIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useParams } from "next/navigation";
import NoData from "@/components/empty-states/NoData";

// Page 1 is server-fetched (sections/BlogCategorySection); this owns "view all".
const BlogCategory = ({
    initialCategories = [],
    initialCurrentPage = 1,
    initialHasMore = false,
    tag,
}) => {
    const { t } = useTranslation();
    const { blogCategorySlug: activeCategorySlug } = useParams();
    const [categories, setCategories] = useState(initialCategories);
    const [currentPage, setCurrentPage] = useState(initialCurrentPage);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isLoadMore, setIsLoadMore] = useState(false);

    const handleLoadMore = async () => {
        try {
            setIsLoadMore(true);
            const res = await getBlogCategoriesApi.getBlogCategories({
                page: currentPage + 1,
            });
            if (res?.data?.error === false) {
                setCategories((prev) => [...prev, ...(res?.data?.data?.data ?? [])]);
                setCurrentPage(res?.data?.data?.current_page);
                setHasMore(
                    res?.data?.data?.current_page < res?.data?.data?.last_page
                );
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoadMore(false);
        }
    };

    return (
        <div className="flex flex-col border rounded-lg">
            <div className="p-4">
                <p className="font-bold">{t("category")}</p>
            </div>
            <div className="border-b w-full" />
            <div className="flex flex-col">
                {categories.length === 0 ? (
                    <NoData title={t("noCategoryFound")} />
                ) : (
                    <div className="flex flex-col gap-3 p-4">
                        {categories.map((cat) => {
                            const isActive = activeCategorySlug === cat?.slug;
                            return (
                                <CustomLink
                                    href={`/blogs/category/${cat?.slug}${tag ? `?tag=${tag}` : ""}`}
                                    key={cat?.id}
                                    className={`flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors ${isActive ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/10"}`}
                                >
                                    <span>{cat?.translated_name}</span>
                                    {!isActive && <CaretRightIcon size={14} weight="bold" className="shrink-0 text-muted-foreground" />}
                                </CustomLink>
                            );
                        })}
                        {hasMore && (
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoadMore}
                                className="text-sm text-primary font-medium px-2 text-left hover:underline disabled:opacity-50"
                            >
                                {isLoadMore ? t("loading") : t("viewMore")}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogCategory;
