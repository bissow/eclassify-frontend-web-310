import { Skeleton } from "@/components/ui/skeleton";
import BlogCardSkeleton from "@/features/blogs/shared/BlogCardSkeleton";

// Server-safe fallbacks: no t() (client-only) so these can sit in a
// server-rendered <Suspense fallback>. Section titles render as bars.
export const BlogsListSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <BlogCardSkeleton key={index} />
    ))}
  </div>
);

export const BlogCategorySkeleton = () => (
  <div className="flex flex-col border rounded-lg">
    <div className="p-4">
      <Skeleton className="h-5 w-24" />
    </div>
    <div className="border-b w-full" />
    <div className="flex flex-col gap-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-1">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export const TagsSkeleton = () => (
  <div className="flex flex-col border rounded-lg">
    <div className="p-4">
      <Skeleton className="h-5 w-16" />
    </div>
    <div className="border-b w-full" />
    <div className="p-4 flex flex-wrap gap-2">
      {Array.from({ length: 10 }).map((_, index) => (
        <Skeleton key={index} className="w-20 h-8" />
      ))}
    </div>
  </div>
);

export const PopularPostsSkeleton = () => (
  <div className="flex flex-col border rounded-xl">
    <div className="p-4 border-b">
      <Skeleton className="h-5 w-32" />
    </div>
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex gap-3 px-4 py-2 items-center">
          <Skeleton className="h-12 w-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
