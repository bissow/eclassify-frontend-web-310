import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const JobApplicationSkeleton = ({ count = 5 }) => {
  return (
    <div className="overflow-x-auto w-full">
      {/* Mobile/Tablet cards */}
      <div className="flex flex-col gap-4 mt-2 md:hidden">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="border border-gray-100 rounded-xl px-4 py-2 flex flex-col gap-3 bg-white shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2 w-full">
                <Skeleton className="h-5 w-[60%]" />
                <Skeleton className="h-4 w-[40%]" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>

            <div className="border-t pt-2 flex justify-between items-center">
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-7 w-24 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block min-w-full overflow-hidden border rounded-md">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="text-xs sm:text-sm">
              <TableHead>
                <Skeleton className="h-5 w-[60%]" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-[70%]" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-[50%]" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-[70%]" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-[60%]" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs sm:text-sm">
            {Array.from({ length: count }).map((_, index) => (
              <TableRow key={index} className="hover:bg-muted">
                <TableCell>
                  <Skeleton className="h-4 w-[85%]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[80%]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[75%]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[90%]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[70%]" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default JobApplicationSkeleton;


