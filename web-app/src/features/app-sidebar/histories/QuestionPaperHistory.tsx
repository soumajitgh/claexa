import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar.tsx";
import { api } from "@/api";
import type { QuestionPaperListResponse } from "@/api/question-paper";

export function QuestionPaperHistory({
  isMobile,
  onCloseMobile,
}: {
  isMobile: boolean;
  onCloseMobile: () => void;
}) {
  const { data: recentPapers, isLoading: loadingPapers } = useQuery({
    queryKey: ["sidebar:qp:recent"],
    queryFn: () =>
      api.questionPapers.getAll({
        limit: 30,
        sortBy: "createdAt",
        sortDirection: "desc",
      }),
    staleTime: 60_000,
  });

  return (
    <>
      <SidebarMenu>
        {loadingPapers ? (
          <>
            <SidebarMenuSkeleton />
            <SidebarMenuSkeleton />
            <SidebarMenuSkeleton />
          </>
        ) : recentPapers?.data?.length === 0 ? (
          <SidebarMenuItem>
            <div className="text-xs text-muted-foreground px-2 py-1">
              No papers yet
            </div>
          </SidebarMenuItem>
        ) : (
          recentPapers?.data?.map((p: QuestionPaperListResponse) => (
            <SidebarMenuItem key={p.id} className="min-w-0">
              <SidebarMenuButton
                asChild
                onClick={() => isMobile && onCloseMobile()}
                className="min-w-0"
              >
                <Link to={`/question-paper/studio/${p.id}`}>
                  <span className="truncate max-w-full">
                    {p.name || "Untitled paper"}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </>
  );
}
