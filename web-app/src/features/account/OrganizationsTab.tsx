import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Mail, UserPlus, Trash2, Plus, Clock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/context/auth";

interface OrganizationMember {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "member";
  status: string;
}

interface OrganizationInvite {
  id: string;
  email: string;
  role: "admin" | "member";
  status: string;
  organizationId: string;
  organizationName: string;
}

export function OrganizationsTab() {
  const { currentUser } = useAuth();
  const [deletingInviteId, setDeletingInviteId] = useState<string | null>(null);
  const [createInviteOpen, setCreateInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);

  // Check if user is an admin of their active organization
  const isActiveOrgAdmin = currentUser?.activeOrganization?.role === "admin";

  // Mock data - in real implementation this would come from API
  const organizationMembers: OrganizationMember[] = [];
  const organizationInvites: OrganizationInvite[] = [];
  const isLoadingMembers = false;
  const isLoadingOrgInvites = false;

  const handleCreateInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsCreatingInvite(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Invite sent successfully");
      setCreateInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      setIsCreatingInvite(false);
    }, 1000);
  };

  const handleDeleteInvite = (inviteId: string) => {
    setDeletingInviteId(inviteId);

    // Simulate API call
    setTimeout(() => {
      toast.success("Invite deleted successfully");
      setDeletingInviteId(null);
    }, 1000);
  };

  if (!isActiveOrgAdmin) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Organization Management
              </h3>
              <p className="text-muted-foreground">
                You need to be an organization admin to access management
                features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="manage-members" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="manage-members"
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Manage Members
            {organizationMembers.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {organizationMembers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="manage-invites"
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Manage Invites
            {organizationInvites.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {organizationInvites.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage-members" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Organization Members
              </CardTitle>
              <CardDescription>
                Manage members in your organization (
                {currentUser?.activeOrganization?.name})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMembers ? (
                <div className="space-y-2">
                  <div className="h-16 bg-muted animate-pulse rounded-lg" />
                  <div className="h-16 bg-muted animate-pulse rounded-lg" />
                </div>
              ) : organizationMembers.length > 0 ? (
                <div className="space-y-3">
                  {organizationMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{member.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            member.role === "admin" ? "default" : "secondary"
                          }
                        >
                          {member.role}
                        </Badge>
                        <Badge
                          variant={
                            member.status === "active" ? "default" : "secondary"
                          }
                          className={
                            member.status === "active"
                              ? "bg-green-100 text-green-700 border-green-300"
                              : ""
                          }
                        >
                          {member.status || "active"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Members Found</h3>
                  <p className="text-muted-foreground">
                    No members found in your organization.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage-invites" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Organization Invites
                  </CardTitle>
                  <CardDescription>
                    Manage invitations for your organization (
                    {currentUser?.activeOrganization?.name})
                  </CardDescription>
                </div>
                <Dialog
                  open={createInviteOpen}
                  onOpenChange={setCreateInviteOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Send Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Organization Invite</DialogTitle>
                      <DialogDescription>
                        Invite a new member to join your organization.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email address"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={inviteRole}
                          onValueChange={(value: "admin" | "member") =>
                            setInviteRole(value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                        onClick={() => setCreateInviteOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateInvite}
                        disabled={isCreatingInvite}
                      >
                        {isCreatingInvite ? "Sending..." : "Send Invite"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingOrgInvites ? (
                <div className="space-y-2">
                  <div className="h-16 bg-muted animate-pulse rounded-lg" />
                  <div className="h-16 bg-muted animate-pulse rounded-lg" />
                </div>
              ) : organizationInvites.length > 0 ? (
                <div className="space-y-3">
                  {organizationInvites.map((invite: OrganizationInvite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Mail className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="font-medium">{invite.email}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                              Role:{" "}
                              <Badge variant="outline" className="ml-1">
                                {invite.role}
                              </Badge>
                            </span>
                            <span>•</span>
                            <span>
                              Status:{" "}
                              <Badge
                                variant={
                                  invite.status === "pending"
                                    ? "secondary"
                                    : invite.status === "accepted"
                                    ? "default"
                                    : "default"
                                }
                                className={`ml-1 ${
                                  invite.status === "accepted"
                                    ? "bg-green-100 text-green-700 border-green-300"
                                    : ""
                                }`}
                              >
                                {invite.status}
                              </Badge>
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteInvite(invite.id)}
                        disabled={
                          deletingInviteId === invite.id ||
                          invite.status === "accepted"
                        }
                        className={`${
                          invite.status === "accepted"
                            ? "text-muted-foreground cursor-not-allowed opacity-50"
                            : "text-destructive hover:text-destructive hover:bg-destructive/10"
                        }`}
                      >
                        {deletingInviteId === invite.id ? (
                          <Clock className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        {invite.status === "accepted" ? "Accepted" : "Delete"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Pending Invites
                  </h3>
                  <p className="text-muted-foreground">
                    No pending invitations have been sent from your
                    organization.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
