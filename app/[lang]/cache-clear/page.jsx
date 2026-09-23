import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ALL_CACHE_TAGS, CACHE_TAGS } from "@/lib/server/cacheTags";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CheckCircleIcon, ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

async function clearAllCache() {
    "use server";

    ALL_CACHE_TAGS.forEach((tag) => revalidateTag(tag, "max"));

    redirect("/cache-clear?cleared=1");
}

export default async function CacheClearPage({ searchParams }) {
    const { cleared } = await searchParams;

    return (
        <div className="flex min-h-[70vh] items-center justify-center bg-muted/30 px-4 py-16">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowsClockwiseIcon className="size-5 text-primary" />
                        SEO Cache
                    </CardTitle>
                    <CardDescription>
                        Clears cached SEO data so pages fetch the latest content on next visit.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {cleared === "1" && (
                        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                            <CheckCircleIcon className="size-4 shrink-0" />
                            Cache cleared for all tags below.
                        </div>
                    )}

                    <ul className="divide-y rounded-md border">
                        {CACHE_TAGS.map(({ tag, label }) => (
                            <li
                                key={tag}
                                className="flex items-center justify-between px-4 py-2.5 text-sm"
                            >
                                <span className="text-foreground">{label}</span>
                                <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                    {tag}
                                </code>
                            </li>
                        ))}
                    </ul>

                    <form action={clearAllCache}>
                        <Button type="submit" className="w-full">
                            Clear All Cache
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
