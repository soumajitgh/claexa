import { Skeleton } from "@/components/ui/skeleton.tsx";

export function QuestionPaperStudioSkeleton() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between bg-muted px-4 py-2.5 border-b">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-px" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-9 w-20 rounded" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Vertical Tabs Skeleton */}
        <div className="w-64 border-r flex flex-col">
          {/* Tab Headers */}
          <div className="flex border-b">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-10 w-1/2" />
          </div>
          
          {/* Question Navigator Grid */}
          <div className="p-4 space-y-1">
            <div className="grid grid-cols-4 gap-1">
              <Skeleton className="h-12 w-full rounded" />
              <Skeleton className="h-12 w-full rounded" />
              <Skeleton className="h-12 w-full rounded" />
              <Skeleton className="h-12 w-full rounded" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <Skeleton className="h-12 w-full rounded" />
              <Skeleton className="h-12 w-full rounded" />
              <Skeleton className="h-12 w-full rounded" />
              <Skeleton className="h-12 w-full rounded" />
            </div>
            <div className="grid grid-cols-4 gap-1">
              <Skeleton className="h-12 w-full rounded" />
              <Skeleton className="h-12 w-full rounded" />
              <Skeleton className="h-12 w-full rounded" />
              <Skeleton className="h-12 w-full rounded border-dashed" />
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Question Header */}
          <div className="flex justify-between items-center p-4 border-b bg-background">
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-16 rounded" />
              <Skeleton className="h-9 w-9 rounded" />
            </div>
          </div>

          {/* Question Content Area */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Question Text */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-11/12" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-10/12" />
              </div>

              {/* Sub-questions Accordion */}
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border rounded-md">
                    <div className="flex items-center justify-between p-4 bg-accent/40">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
