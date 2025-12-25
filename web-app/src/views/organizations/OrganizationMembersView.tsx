import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { OrganizationMember } from "@/api";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, UserPlus, Users, Mail, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/context/auth";

const OrganizationMembersView: React.FC = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [selectedMember, setSelectedMember] =
    useState<OrganizationMember | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [updateRoleDialogOpen, setUpdateRoleDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Get current organization ID
  const organizationId = currentUser?.activeOrganization?.id;

  // Fetch organization members using new organization-specific endpoint
  const { data: membersData, isLoading: isMembersLoading } = useQuery({
    queryKey: ["organizationMembers", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("No organization ID available");
      }

      const response = await api.organization.getMembersByOrganizationId(
        organizationId
      );
      if (!response.success) {
        throw new Error("Failed to fetch organization members");
      }

      // Transform the response data to match the expected format
      const members = response.data.map((member: OrganizationMember) => ({
        ...member,
        // Ensure all required properties are present
        fullName: member.fullName || member.email.split("@")[0] || "",
        status: member.status || "active",
        avatarUrl: member.avatarUrl || "",
      }));

      return {
        members,
        totalCount: members.length,
        activeCount: members.filter(
          (m: OrganizationMember) => m.status === "active"
        ).length,
      };
    },
    enabled: !!organizationId,
  });

  // Create invite mutation
  const createInviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const response = await api.organization.addMember(email, role);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizationInvites", organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["organizationMembers", organizationId],
      });
      toast.success("Invitation sent successfully");
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("member");
    },
    onError: (error) => {
      toast.error("Failed to send invitation");
      console.error("Failed to create invite:", error);
    },
  });

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: string;
    }) => {
      const response = await api.organization.updateMemberRole(memberId, role);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizationMembers", organizationId],
      });
      toast.success("Member role updated successfully");
      setUpdateRoleDialogOpen(false);
      setSelectedMember(null);
      setSelectedRole("");
    },
    onError: (error) => {
      toast.error("Failed to update member role");
      console.error("Failed to update member role:", error);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await api.organization.removeMember(memberId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizationMembers", organizationId],
      });
      toast.success("Member removed successfully");
      setConfirmDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error) => {
      toast.error("Failed to remove member");
      console.error("Failed to remove member:", error);
    },
  });

  // Update member status mutation using the slider toggle
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      memberId,
      status,
    }: {
      memberId: string;
      status: "active" | "inactive";
    }) => {
      const response = await api.organization.updateMemberStatus(
        memberId,
        status
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizationMembers", organizationId],
      });
      // Individual success messages are now handled in the handleUpdateStatus function
    },
    onError: (error) => {
      // Individual error messages are now handled in the handleUpdateStatus function
      console.error("Failed to update member status:", error);
    },
  });

  const handleCreateInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    createInviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const handleUpdateRole = () => {
    if (!selectedMember || !selectedRole) {
      toast.error("Please select a role");
      return;
    }

    updateRoleMutation.mutate({
      memberId: selectedMember.id,
      role: selectedRole,
    });
  };

  const handleRemoveMember = () => {
    if (!selectedMember) {
      return;
    }

    removeMemberMutation.mutate(selectedMember.id);
  };

  const handleUpdateStatus = (member: OrganizationMember) => {
    // Toggle status between active and inactive
    const newStatus = member.status === "active" ? "inactive" : "active";
    const memberName = member.fullName || member.email;

    // Show action in toast
    toast.info(
      `${
        newStatus === "active" ? "Activating" : "Deactivating"
      } ${memberName}...`
    );

    updateStatusMutation.mutate(
      {
        memberId: member.id,
        status: newStatus,
      },
      {
        onSuccess: () => {
          toast.success(
            `${memberName} is now ${
              newStatus === "active" ? "active" : "inactive"
            }`
          );
        },
        onError: () => {
          toast.error(`Failed to update status for ${memberName}`);
        },
      }
    );
  };

  // Helper function to get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Filter members based on search query
  const filteredMembers = membersData?.members
    ? membersData.members.filter(
        (member: OrganizationMember) =>
          (member.fullName?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          ) ||
          (member.email?.toLowerCase() || "").includes(
            searchQuery.toLowerCase()
          ) ||
          (member.role?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-1.5">
        <h2 className="text-2xl font-bold">Organization Members</h2>
        <p className="text-muted-foreground">
          Manage your team members and their roles
        </p>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-row justify-between items-center gap-3">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage users in your organization
              </CardDescription>
            </div>

            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              className="pl-8 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          {isMembersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredMembers && filteredMembers.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <span>Status</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-muted-foreground"
                              >
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                <path d="M12 17h.01"></path>
                              </svg>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Use the toggle switch to activate or deactivate a
                              member
                            </p>
                            <p className="text-xs mt-1 opacity-80">
                              Inactive members cannot access organization
                              resources
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member: OrganizationMember) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatarUrl} />
                            <AvatarFallback className="bg-primary/10">
                              {getInitials(member.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.role === "admin" ? "default" : "secondary"
                          }
                          className="capitalize"
                        >
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <div className="relative">
                                      <Switch
                                        checked={member.status !== "inactive"}
                                        disabled={
                                          updateStatusMutation.isPending
                                        }
                                        onCheckedChange={() =>
                                          handleUpdateStatus(member)
                                        }
                                        className={`${
                                          member.status !== "inactive"
                                            ? "data-[state=checked]:bg-green-500"
                                            : ""
                                        }
                                                  ${
                                                    updateStatusMutation.isPending &&
                                                    updateStatusMutation
                                                      .variables?.memberId ===
                                                      member.id
                                                      ? "opacity-70"
                                                      : ""
                                                  }`}
                                      />
                                      {updateStatusMutation.isPending &&
                                        updateStatusMutation.variables
                                          ?.memberId === member.id && (
                                          <Loader2 className="h-3 w-3 absolute top-1 right-[-18px] animate-spin text-primary" />
                                        )}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {member.status !== "inactive"
                                      ? "Toggle off to deactivate this member"
                                      : "Toggle on to activate this member"}
                                  </p>
                                  <p className="text-xs mt-1 opacity-80">
                                    {member.status !== "inactive"
                                      ? "Inactive members cannot access organization resources"
                                      : "Active members have access to organization resources"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              {updateStatusMutation.isPending &&
                              updateStatusMutation.variables?.memberId ===
                                member.id ? (
                                <span className="text-sm text-muted-foreground animate-pulse">
                                  Updating...
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5">
                                  {member.status !== "inactive" ? (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="text-green-500"
                                    >
                                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                  ) : (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="text-gray-400"
                                    >
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <line
                                        x1="8"
                                        y1="12"
                                        x2="16"
                                        y2="12"
                                      ></line>
                                    </svg>
                                  )}
                                  <span
                                    className={`${
                                      member.status !== "inactive"
                                        ? "text-green-700 dark:text-green-500"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {member.status === "inactive"
                                      ? "Inactive"
                                      : "Active"}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(member.joinedAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        {/* Empty cell - no actions dropdown needed */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="font-medium">
                {searchQuery
                  ? "No members found matching your search"
                  : "No members found"}
              </p>
              <p className="text-sm mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Start inviting members to join your organization"}
              </p>
              {searchQuery && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your organization.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                placeholder="example@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                type="email"
                autoComplete="email"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleCreateInvite}
              disabled={createInviteMutation.isPending}
            >
              {createInviteMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Role Dialog */}
      <Dialog
        open={updateRoleDialogOpen}
        onOpenChange={setUpdateRoleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              Update the role of {selectedMember?.fullName || "this member"}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-3 mb-2">
              <Avatar>
                <AvatarImage src={selectedMember?.avatarUrl} />
                <AvatarFallback className="bg-primary/10">
                  {selectedMember?.fullName
                    ? getInitials(selectedMember.fullName)
                    : ""}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedMember?.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedMember?.email}
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="role" className="text-sm font-medium">
                New Role
              </label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                "Update Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member from your
              organization?
            </DialogDescription>
          </DialogHeader>

          {selectedMember && (
            <div className="flex items-center gap-3 my-4">
              <Avatar>
                <AvatarImage src={selectedMember.avatarUrl} />
                <AvatarFallback className="bg-primary/10">
                  {getInitials(selectedMember.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedMember.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedMember.email}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={removeMemberMutation.isPending}
            >
              {removeMemberMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                "Remove Member"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationMembersView;
