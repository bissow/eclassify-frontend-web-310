import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lang/useTranslation";
import { useSearchParams } from "next/navigation";
import { useNavigate } from "@/hooks/useNavigate";
import { useAdsBasePath } from "@/hooks/useAdsBasePath";

const BudgetFilter = () => {
  const { t } = useTranslation();

  const basePath = useAdsBasePath();
  const { navigate } = useNavigate();
  const searchParams = useSearchParams();
  const [budget, setBudget] = useState({
    minPrice: searchParams.get("min_price") || "",
    maxPrice: searchParams.get("max_price") || "",
  });

  const { minPrice, maxPrice } = budget;

  const handleMinMaxPrice = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("min_price", minPrice);
    newSearchParams.set("max_price", maxPrice);
    // Real navigation, not history.pushState: the listing is server-rendered
    // from the query string, so the server has to re-run. scroll:false keeps
    // the user where they are in the filter panel.
    navigate(`${basePath}?${newSearchParams.toString()}`, { scroll: false });
  };


  return (
    <div className="flex flex-col gap-4 mt-4">
      <form className="flex gap-4">
        <Input
          type="number"
          placeholder={t("from")}
          min={0}
          onChange={(e) =>
            setBudget((prev) => ({ ...prev, minPrice: Number(e.target.value) }))
          }
          value={minPrice}
        />
        <Input
          type="number"
          placeholder={t("to")}
          min={0}
          onChange={(e) =>
            setBudget((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
          }
          value={maxPrice}
        />
      </form>
      <Button
        type="submit"
        className="hover:bg-primary hover:text-white"
        variant="outline"
        disabled={minPrice == null || maxPrice == null || minPrice >= maxPrice}
        onClick={handleMinMaxPrice}
      >
        {t("apply")}
      </Button>
    </div>
  );
};

export default BudgetFilter;
