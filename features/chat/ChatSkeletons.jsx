import { Skeleton } from "@/components/ui/skeleton";

// Loading placeholders for the chat module.

export const ChatListCardSkeleton = ({ count = 1 }) =>
  Array.from({ length: count }, (_, i) => (
    <div key={i} className="p-4 border-b">
      <div className="flex items-start gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-[40%] mb-2 rounded-md" />
          <Skeleton className="h-3 w-[70%] rounded-md" />
        </div>
        <Skeleton className="h-3 w-[15%] rounded-md" />
      </div>
    </div>
  ));

export const AdListSkeleton = ({ count = 6 }) =>
  Array.from({ length: count }, (_, i) => (
    <div key={i} className="p-2 sm:p-4 border rounded-xl flex items-center gap-4">
      <Skeleton className="w-11 h-11 rounded-full shrink-0" />

      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-1 w-1 rounded-full hidden sm:block" />
          <div className="flex -space-x-2">
            <Skeleton className="w-5 h-5 rounded-full border-2 border-white" />
            <Skeleton className="w-5 h-5 rounded-full border-2 border-white" />
          </div>
          <Skeleton className="h-3 w-8" />
        </div>
      </div>

      <div className="flex flex-col items-end justify-between h-full py-0.5 shrink-0 min-h-11">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
  ));

export const BlockedUserSkeleton = ({ count = 1 }) =>
  Array.from({ length: count }, (_, i) => (
    <div key={i} className="flex items-center justify-between p-2">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-16 rounded-md" />
    </div>
  ));

// The ad summary above the selling-tab list.
export const ChatListHeaderSkeleton = () => (
  <div className="flex items-center gap-3 w-full">
    <Skeleton className="size-8 rounded-full" />
    <div className="flex-1 flex items-center gap-2">
      <Skeleton className="size-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-6 w-16" />
  </div>
);

// Mixed sizes so it reads as a conversation.
export const ChatMessagesSkeleton = () => (
  <div className="flex flex-col gap-4 w-full">
    <div className="flex flex-col gap-1 w-[65%] max-w-[80%]">
      <Skeleton className="h-16 w-full rounded-md" />
      <Skeleton className="h-3 w-[30%] rounded-md" />
    </div>

    <div className="flex flex-col gap-1 w-[70%] max-w-[80%] self-end">
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-3 w-[30%] self-end rounded-md" />
    </div>

    <div className="flex flex-col gap-1 w-[50%] max-w-[80%]">
      <Skeleton className="h-32 w-full rounded-md" />
      <Skeleton className="h-3 w-[30%] rounded-md" />
    </div>

    <div className="flex flex-col gap-1 w-[60%] max-w-[80%] self-end">
      <Skeleton className="h-12 w-full rounded-md" />
      <Skeleton className="h-3 w-[30%] self-end rounded-md" />
    </div>

    <div className="flex flex-col gap-1 w-[45%] max-w-[80%]">
      <Skeleton className="h-14 w-full rounded-md" />
      <Skeleton className="h-3 w-[30%] rounded-md" />
    </div>

    <div className="flex flex-col gap-1 w-[60%] max-w-[80%] self-end">
      <Skeleton className="h-12 w-full rounded-md" />
      <Skeleton className="h-3 w-[30%] self-end rounded-md" />
    </div>

    <div className="flex flex-col gap-1 w-[45%] max-w-[80%]">
      <Skeleton className="h-14 w-full rounded-md" />
      <Skeleton className="h-3 w-[30%] rounded-md" />
    </div>
  </div>
);

// Placeholder while the selected chat is still resolving.
export const SendMessageSkeleton = () => (
  <div className="p-4 flex items-center gap-2 shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.08)]">
    <Skeleton className="size-5 rounded-md shrink-0" />
    <Skeleton className="flex-1 h-10 rounded-md" />
    <Skeleton className="size-9 rounded-md shrink-0" />
  </div>
);
