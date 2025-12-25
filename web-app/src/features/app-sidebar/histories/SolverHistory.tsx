import { Link } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuAction } from "@/components/ui/sidebar.tsx";
import { MoreHorizontal, Loader } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

type SolverSession = { id: string; title: string; createdAt: number };

const SOLVER_KEY = "solver:sessions:v1";

function readSolver(): SolverSession[] {
  try {
    const raw = localStorage.getItem(SOLVER_KEY);
    return raw ? (JSON.parse(raw) as SolverSession[]) : [];
  } catch {
    return [];
  }
}
function writeSolver(items: SolverSession[]) {
  localStorage.setItem(SOLVER_KEY, JSON.stringify(items));
}

type RenameDialogState = {
  open: boolean;
  id?: string;
  value: string;
  current?: string;
  saving?: boolean;
};
type DeleteDialogState = {
  open: boolean;
  id?: string;
  title?: string;
  deleting?: boolean;
};

export function SolverHistory({
  isMobile,
  onCloseMobile,
}: {
  isMobile: boolean;
  onCloseMobile: () => void;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["sidebar:solver:recent"],
    queryFn: async () => readSolver().sort((a, b) => b.createdAt - a.createdAt),
    staleTime: 60_000,
  });

  const [renameDialog, setRenameDialog] = useState<RenameDialogState>({
    open: false,
    value: "",
  });
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
  });

  const openRename = (id: string, title?: string) =>
    setRenameDialog({
      open: true,
      id,
      value: (title ?? "").trim(),
      current: title ?? "",
    });

  const openDelete = (id: string, title?: string) =>
    setDeleteDialog({ open: true, id, title });

  const handleConfirmRename = async () => {
    const { id, value, current } = renameDialog;
    const title = (value ?? "").trim();
    if (!id || !title || title === current) {
      setRenameDialog((s) => ({ ...s, open: false }));
      return;
    }
    const items = readSolver();
    const i = items.findIndex((x) => x.id === id);
    if (i >= 0) {
      items[i] = { ...items[i], title };
      writeSolver(items);
      toast.success("Renamed successfully");
      await queryClient.invalidateQueries({
        queryKey: ["sidebar:solver:recent"],
      });
    }
    setRenameDialog({ open: false, value: "" });
  };

  const handleConfirmDelete = async () => {
    const { id } = deleteDialog;
    if (!id) return;
    const items = readSolver().filter((x) => x.id !== id);
    writeSolver(items);
    toast.success("Session deleted");
    await queryClient.invalidateQueries({
      queryKey: ["sidebar:solver:recent"],
    });
    setDeleteDialog({ open: false });
  };

  return (
    <>
      <SidebarMenu className="gap-0.5">
        {isLoading ? (
          <>
            <SidebarMenuSkeleton />
            <SidebarMenuSkeleton />
            <SidebarMenuSkeleton />
          </>
        ) : !data?.length ? (
          <SidebarMenuItem>
            <div className="text-xs text-muted-foreground px-2 py-1">
              No sessions yet
            </div>
          </SidebarMenuItem>
        ) : (
          data.map((s) => (
            <SidebarMenuItem key={s.id}>
              <SidebarMenuButton
                asChild
                onClick={() => isMobile && onCloseMobile()}
                size="sm"
              >
                <Link to={`/dashboard/session/${s.id}`}>
                  <span className="truncate max-w-[210px]">
                    {s.title || "Untitled session"}
                  </span>
                </Link>
              </SidebarMenuButton>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction aria-label="More options" showOnHover>
                    <MoreHorizontal className="h-4 w-4" />
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => openRename(s.id, s.title)}>
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => openDelete(s.id, s.title)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>

      <Dialog
        open={renameDialog.open}
        onOpenChange={(open) => setRenameDialog((s) => ({ ...s, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Session</DialogTitle>
            <DialogDescription>
              Enter a new name for this session.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={renameDialog.value}
            placeholder="Untitled"
            onChange={(e) =>
              setRenameDialog((s) => ({ ...s, value: e.target.value }))
            }
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleConfirmRename}
              disabled={!renameDialog.value?.trim() || renameDialog.saving}
            >
              {renameDialog.saving ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Save</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((s) => ({ ...s, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "
              {deleteDialog.title || "this session"}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={!!deleteDialog.deleting}
            >
              {deleteDialog.deleting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
