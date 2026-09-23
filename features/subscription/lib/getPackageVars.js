// utils/index.jsx

export const getPackageVars = (pckg) => {
    const descriptionItems =
        Array.isArray(pckg?.translated_key_points) &&
            pckg.translated_key_points.length > 0
            ? pckg.translated_key_points
            : (pckg?.translated_description || pckg?.description || "")
                .split("\r\n")
                .filter(Boolean);

    return {
        descriptionItems,
        totalDays: pckg?.duration,
        totalItems: pckg?.item_limit,
        listingDurationDays: pckg?.listing_duration_days
    }
}
