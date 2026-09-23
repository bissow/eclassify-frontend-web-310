import { Skeleton } from "@/components/ui/skeleton.jsx";
import { etagFetch } from "@/lib/server/etagFetch";
import OurBlogsCarousel from "@/features/marketing/OurBlogsCarousel";

const getBlogs = async (langCode) => {
  try {
    const json = await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}blogs`,
      {
        key: `blogs:${langCode || "en"}`,
        headers: { "Content-Language": langCode || "en" },
      }
    );
    return json?.data?.data || [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
};

const OurBlogs = async ({ langCode }) => {
  const blogs = await getBlogs(langCode);

  if (!blogs?.length) return null;

  return <OurBlogsCarousel blogs={blogs} />;
};


const BlogCardSkeletonItem = () => (
  <div className="p-4 rounded-3xl flex flex-col gap-4 border bg-white h-full">
    <Skeleton className="w-full aspect-388/200 rounded-[8px]" />
    <Skeleton className="h-7 w-2/3" />
    <Skeleton className="h-12 w-full" />
    <div className="flex items-center gap-3 mt-auto">
      <Skeleton className="h-7 w-24" />
      <Skeleton className="size-5 rounded-full" />
    </div>
  </div>
);

export const OurBlogsSkeleton = () => {
  return (
    <section className="py-28 bg-muted" id="ourBlogs">
      <div className="container">
        <div className="flex items-center flex-col gap-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-12 w-100 max-w-full" />
        </div>
        <div className="w-full mt-20 overflow-hidden">
          <div className="flex -ml-3 md:-ml-7.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="min-w-0 shrink-0 grow-0 sm:basis-1/2 xl:basis-1/3 pl-3 md:pl-7.5 basis-full"
              >
                <BlogCardSkeletonItem />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center mt-7.5 gap-4">
          <Skeleton className="size-10 rounded" />
          <Skeleton className="size-10 rounded" />
        </div>
      </div>
    </section>
  );
};

export default OurBlogs;
