"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addItemReviewApi } from "@/lib/api";
import { useTranslation } from "@/lang/useTranslation";
import { StarIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

const GiveReviewModal = ({ isOpen, setIsOpen, item, onReviewed }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [errors, setErrors] = useState({ rating: "", review: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setHoveredRating(0);
      setReview("");
      setErrors({ rating: "", review: "" });
    }
  }, [isOpen]);

  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
    setErrors((prev) => ({ ...prev, rating: "" }));
  };

  const handleReviewChange = (e) => {
    setReview(e.target.value);
    setErrors((prev) => ({ ...prev, review: "" }));
  };

  const validateForm = () => {
    const newErrors = {
      rating: rating === 0 ? t("pleaseSelectRating") : "",
      review: !review.trim() ? t("pleaseWriteReview") : "",
    };
    setErrors(newErrors);
    return !newErrors.rating && !newErrors.review;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await addItemReviewApi.addItemReview({
        item_id: item?.id,
        review,
        ratings: rating,
      });
      if (res?.data?.error === false) {
        toast.success(res?.data?.message);
        onReviewed?.(item?.id, res?.data?.data);
        setIsOpen(false);
      } else {
        toast.error(res?.data?.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(t("somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="px-6 py-6 sm:max-w-[500px]"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">
            {t("rateSeller")}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            {t("rateYourExp")}
          </DialogDescription>
        </DialogHeader>

        <div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <button
                key={starValue}
                type="button"
                className="p-1 focus:outline-hidden"
                onClick={() => handleRatingClick(starValue)}
                onMouseEnter={() => setHoveredRating(starValue)}
                onMouseLeave={() => setHoveredRating(0)}
                aria-label={`Rate ${starValue} stars out of 5`}
              >
                <StarIcon
                  size={32}
                  weight={
                    (hoveredRating || rating) >= starValue ? "fill" : "regular"
                  }
                  className={
                    (hoveredRating || rating) >= starValue
                      ? "text-yellow-400"
                      : "text-gray-200"
                  }
                />
              </button>
            ))}
          </div>
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
          )}
        </div>

        <div>
          <Textarea
            placeholder={t("writeAReview")}
            value={review}
            onChange={handleReviewChange}
            className={`h-32 resize-none ${
              errors.review ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
          />
          {errors.review && (
            <p className="text-red-500 text-sm mt-1">{errors.review}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            {t("cancel")}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GiveReviewModal;
