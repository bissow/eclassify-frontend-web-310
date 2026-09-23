import { useId } from "react";
import AdCardSkeleton from "@/components/common/AdCardSkeleton";

const AllItemsSkeleton = () => {
  return (
    <>
      {Array.from({ length: 10 }).map(() => (
        <AdCardSkeleton key={useId()} />
      ))}
    </>
  );
};

export default AllItemsSkeleton;
