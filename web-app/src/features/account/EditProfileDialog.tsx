import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const { currentUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [originalFullName, setOriginalFullName] = useState("");
  const queryClient = useQueryClient();

  // Initialize fullName when currentUser changes or dialog opens
  useEffect(() => {
    if (open && currentUser?.profile?.fullName) {
      setFullName(currentUser.profile.fullName);
      setOriginalFullName(currentUser.profile.fullName);
    }
  }, [open, currentUser?.profile?.fullName]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { fullName: string }) => {
      // Note: API implementation excluded as requested
      // This would typically call api.account.updateProfile(data)
      return Promise.resolve(data);
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["userMe"] });
      setOriginalFullName(fullName.trim()); // Update the original name after successful update
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      toast.error("Failed to update profile. Please try again.");
      console.error("Profile update error:", error);
    },
  });

  const handleUpdateProfile = () => {
    if (!fullName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }
    if (fullName.trim() === originalFullName.trim()) {
      toast.info("No changes detected");
      return;
    }
    updateProfileMutation.mutate({ fullName: fullName.trim() });
  };

  // Check if the form has changed
  const hasChanges =
    fullName.trim() !== originalFullName.trim() && fullName.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] mx-4 sm:mx-0">
        <DialogHeader className="space-y-1 sm:space-y-2">
          <DialogTitle className="text-lg sm:text-xl">Edit Profile</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Update your profile information below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-3">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
            disabled={updateProfileMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateProfile}
            className="w-full sm:w-auto"
            disabled={updateProfileMutation.isPending || !hasChanges}
          >
            {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
