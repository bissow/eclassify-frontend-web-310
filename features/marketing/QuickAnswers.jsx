import { Skeleton } from "@/components/ui/skeleton.jsx";
import { etagFetch } from "@/lib/server/etagFetch";
import QuickAnswersAccordion from "@/features/marketing/QuickAnswersAccordion";

const getFaqs = async (langCode) => {
  try {
    const json = await etagFetch(
      `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}faq`,
      {
        key: `faqs:${langCode || "en"}`,
        headers: { "Content-Language": langCode || "en" },
      }
    );
    return json?.data || [];
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
};

const QuickAnswers = async ({ langCode }) => {
  const faqs = await getFaqs(langCode);

  if (!faqs?.length) return null;

  return <QuickAnswersAccordion faqs={faqs} />;
};

export const QuickAnswersSkeleton = () => {
  return (
    <section className="py-28" id="faq">
      <div className="container">
        <div className="flex items-center flex-col gap-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-12 w-100 max-w-full" />
        </div>
        <div className="flex flex-col gap-4 md:gap-8 mt-20">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border rounded-md overflow-hidden p-4">
              <Skeleton className="h-6 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickAnswers;
