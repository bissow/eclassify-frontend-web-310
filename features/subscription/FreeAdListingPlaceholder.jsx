"use client"
import { useTranslation } from "@/lang/useTranslation";
import { CheckCircleIcon } from "@phosphor-icons/react"

const FreeAdListingPlaceholder = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-3 items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border-2 border-dashed shadow-xs mt-8">
            <div className="bg-primary/10 rounded-full">
                <CheckCircleIcon className="size-12 text-primary animate-pulse" weight="bold" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">
                {t("freeAdListingEnabled")}
            </h2>
            <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
                {t("postFreeOfCost")}
            </p>
        </div>
    )
}

export default FreeAdListingPlaceholder
