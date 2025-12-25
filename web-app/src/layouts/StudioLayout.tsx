import { Outlet, useParams, Navigate, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { questionPaperService } from "@/api";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable.tsx";
import { QuestionPaperStudioSkeleton } from "@/features/question-paper-studio/Skeleton";
import StudioVerticalTabComponent from "@/features/question-paper-studio/StudioVerticalTabs";
import { useDeviceBreakpoint } from "@/hooks/use-device-breakpoint";
import { Home, Pen, MoreVertical, Star, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.tsx";
import { RenameQuestionPaperDialog } from "@/features/question-paper/PaperRenameDialog";
import { DeleteQuestionPaperDialog } from "@/features/question-paper/PaperDeleteDialog";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExportButton } from "@/features/question-paper-studio/PaperExportButton";
import type { QuestionPaperResponse } from "@/api";
import { QuestionPaperProvider } from "@/context/question-paper";

// Studio Header Component
function StudioHeader({
  questionPaper,
  onRename,
  onMarkAsFavourite,
  renameOpen,
  setRenameOpen,
}: {
  questionPaper: QuestionPaperResponse;
  onRename: () => void;
  onMarkAsFavourite: () => void;
  renameOpen: boolean;
  setRenameOpen: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center justify-between bg-muted px-4 py-2.5">
        <Breadcrumb className="text-sm">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  onClick={() => navigate("/")}
                >
                  <Home className="h-6 w-6" />
                </Button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <div className="flex items-center gap-2">
                <BreadcrumbPage className="font-medium text-sm">
                  {questionPaper.name}
                </BreadcrumbPage>
                <RenameQuestionPaperDialog
                  questionPaper={questionPaper}
                  asChild
                >
                  <Button variant="ghost" size="icon" className="h-5 w-5">
                    <Pen className="h-3 w-3" />
                  </Button>
                </RenameQuestionPaperDialog>
              </div>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Menu and Export button */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onRename}>
                <Edit3 className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onMarkAsFavourite} disabled>
                <Star className="h-4 w-4 mr-2" />
                Mark as Favourite
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <DeleteQuestionPaperDialog questionPaperId={questionPaper.id} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ExportButton />
        </div>
      </div>

      {/* Rename Dialog triggered from menu */}
      <RenameQuestionPaperDialog
        questionPaper={questionPaper}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />
    </>
  );
}

export function QuestionPaperStudioLayout() {
  const { id } = useParams<{ id: string }>();
  const { isMobile } = useDeviceBreakpoint();
  const [renameOpen, setRenameOpen] = useState(false);

  // Redirect to mobile view if on mobile device
  if (isMobile && id) {
    return <Navigate to={`/mobile/question-paper/studio/${id}`} replace />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["questionPaper", id],
    queryFn: () => questionPaperService.getById(id!),
    enabled: !!id,
  });

  // Show loading state if either real loading or artificial loading is active
  if (isLoading) {
    return <QuestionPaperStudioSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 font-medium">
          Error loading question paper: {(error as Error).message}
        </p>
      </div>
    );
  }

  const questionPaper = data?.data;

  const handleRename = () => {
    setRenameOpen(true);
  };

  const handleMarkAsFavourite = () => {
    toast.info("Mark as favourite feature coming soon!");
  };

  return (
    <QuestionPaperProvider
      value={{
        questionPaper: questionPaper || null,
        isLoading,
        isError,
        error: error || null,
      }}
    >
      <div className="flex flex-col max-h-screen overflow-y-clip">
        {/* Studio Header */}
        {questionPaper && (
          <StudioHeader
            questionPaper={questionPaper}
            onRename={handleRename}
            onMarkAsFavourite={handleMarkAsFavourite}
            renameOpen={renameOpen}
            setRenameOpen={setRenameOpen}
          />
        )}

        {/* Desktop layout: Use resizable panels */}
        <ResizablePanelGroup
          className={"w-screen flex-1"}
          direction="horizontal"
        >
          <ResizablePanel
            className="border-r"
            minSize={25}
            maxSize={35}
            defaultSize={25}
          >
            <StudioVerticalTabComponent />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={80}
            className={"h-screen overflow-y-auto"}
          >
            <Outlet />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </QuestionPaperProvider>
  );
}
