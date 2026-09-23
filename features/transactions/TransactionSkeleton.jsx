import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const TransactionSkeleton = ({ count = 15 }) => {
    return (
        <div className="overflow-x-auto">
            {/* Mobile cards */}
            <div className="flex flex-col gap-4 mt-2 md:hidden">
                {Array(count).fill(0).map((_, index) => (
                    <div
                        key={index}
                        className="border rounded-xl px-4 py-3 flex flex-col gap-3 bg-white"
                    >
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-4 w-[55%]" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                        <div className="border-t pt-2 flex justify-between items-center">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-7 w-24" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block min-w-full overflow-hidden border rounded-md">
                <Table>
                    <TableHeader className="bg-muted">
                        <TableRow className="text-xs sm:text-sm">
                            <TableHead><Skeleton className="h-5 w-[50%]" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-[70%]" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-[60%]" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-[70%]" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-[60%]" /></TableHead>
                            <TableHead><Skeleton className="h-5 w-[70%]" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs sm:text-sm">
                        {Array(count).fill(0).map((_, index) => (
                            <TableRow key={index} className="hover:bg-muted">
                                <TableCell><Skeleton className="h-4 w-[80%]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[85%]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[90%]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[80%]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[70%]" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-[75%]" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default TransactionSkeleton;
