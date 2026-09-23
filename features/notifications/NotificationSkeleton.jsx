import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const NotificationSkeleton = ({ count = 15 }) => {
    return (
        <>
            {/* Mobile skeleton */}
            <div className="sm:hidden -mx-4">
                <div className="flex justify-between p-4 bg-muted border-b">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                </div>
                <div className="divide-y">
                    {Array.from({ length: count }).map((_, index) => (
                        <div key={index} className="flex items-start gap-3 p-4">
                            <Skeleton className="size-12 rounded shrink-0" />
                            <div className="flex flex-1 justify-between gap-2 min-w-0">
                                <div className="flex flex-col gap-2 min-w-0 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-full" />
                                </div>
                                <Skeleton className="h-3 w-14 shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Desktop skeleton */}
            <div className="hidden sm:block overflow-hidden border rounded-md">
                <Table>
                    <TableHeader className="bg-muted">
                        <TableRow className="text-xs sm:text-sm">
                            <TableHead>
                                <Skeleton className="h-5 w-2/4" />
                            </TableHead>
                            <TableHead className="text-center">
                                <Skeleton className="h-5 w-2/4 mx-auto" />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs sm:text-sm">
                        {Array.from({ length: count }).map((_, index) => (
                            <TableRow key={index} className="hover:bg-muted">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="size-12 rounded shrink-0" />
                                        <div className="flex flex-col gap-2 flex-1">
                                            <Skeleton className="h-4 w-2/4" />
                                            <Skeleton className="h-3 w-3/4" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Skeleton className="h-4 w-full mx-auto" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
};

export default NotificationSkeleton;
