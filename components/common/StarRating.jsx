'use client'
import { StarIcon, StarHalfIcon } from "@phosphor-icons/react";

const StarRating = ({ rating = 0, className = "size-4", maxStars = 5, showEmpty = true }) => {

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center gap-1 max-w-full">
            {[...Array(fullStars)].map((_, index) => (
                <StarIcon key={`full-${index}`} className={className} color="#FFD700" weight="fill" />
            ))}

            {hasHalfStar && (
                <StarHalfIcon key="half" className={`rtl:scale-x-[-1] ${className}`} color="#FFD700" weight="fill" />
            )}

            {showEmpty && [...Array(emptyStars)].map((_, index) => (
                <StarIcon key={`empty-${index}`} className={className} color="#0000002E" weight="regular" />
            ))}
        </div>
    );
};

export default StarRating;