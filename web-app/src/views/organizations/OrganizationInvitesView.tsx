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
import type { OrgInvite } from "@/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlusIcon, Mail, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/context/auth";

const OrganizationInvitesView: React.FC = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [selectedInvite, setSelectedInvite] = useState<OrgInvite | null>(null);

  // Get current organization ID
  const organizationId = currentUser?.activeOrganization?.id;

  // Fetch organization invites using new organization-specific endpoint
  const { data: invitesData, isLoading: isInvitesLoading } = useQuery({
    queryKey: ["organizationInvites", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("No organization ID available");
      }

      const response = await api.organization.getInvitesByOrganizationId(
        organizationId
      );
      if (!response.success) {
        throw new Error("Failed to fetch organization invites");
      }
      return response.data;
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

  // Delete invite mutation
  const deleteInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const response = await api.organization.removeInvite(inviteId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizationInvites", organizationId],
      });
      toast.success("Invitation cancelled");
      setSelectedInvite(null);
    },
    onError: (error) => {
      toast.error("Failed to cancel invitation");
      console.error("Failed to delete invite:", error);
    },
  });

  const handleCreateInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    createInviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const handleDeleteInvite = (invite: OrgInvite) => {
    setSelectedInvite(invite);
    deleteInviteMutation.mutate(invite.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invitations</h2>
        <Button onClick={() => setInviteDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Invites Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Pending Invitations
          </CardTitle>
          <CardDescription>
            Invitations sent to potential organization members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isInvitesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : invitesData && invitesData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Invited On</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitesData.map((invite: OrgInvite) => (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">
                        {invite.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invite.role === "admin" ? "outline" : "secondary"
                          }
                        >
                          {invite.role.charAt(0).toUpperCase() +
                            invite.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          {invite.invitedAt
                            ? format(new Date(invite.invitedAt), "MMM d, yyyy")
                            : "Unknown"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteInvite(invite)}
                          disabled={
                            deleteInviteMutation.isPending &&
                            selectedInvite?.id === invite.id
                          }
                        >
                          {deleteInviteMutation.isPending &&
                          selectedInvite?.id === invite.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="sr-only">Cancel Invitation</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No pending invitations found. Invite members to join your
              organization.
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
    </div>
  );
};

export default OrganizationInvitesView;
