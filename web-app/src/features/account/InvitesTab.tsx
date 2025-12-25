import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Check, X, Building, Users } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

// Mock interface for organization invite (excluding API types)
interface OrganizationInvite {
  id: string;
  organization: {
    name: string;
  };
  role: "admin" | "member";
}

export function InvitesTab() {
  const [processingInviteId, setProcessingInviteId] = useState<string | null>(
    null
  );
  const [isLoading] = useState(false);
  const [isError] = useState(false);

  // Mock data - in real implementation this would come from API
  const invites: OrganizationInvite[] = [];

  const handleInviteAction = (
    inviteId: string,
    action: "accept" | "reject"
  ) => {
    setProcessingInviteId(inviteId);

    // Simulate API call
    setTimeout(() => {
      toast.success(`Invite ${action}ed successfully!`);
      setProcessingInviteId(null);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1 sm:space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-1 sm:space-y-2">
          <h2 className="text-lg sm:text-xl font-semibold">
            Organization Invites
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your organization membership invitations.
          </p>
        </div>

        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-destructive font-medium mb-2">
              Failed to load invites
            </p>
            <p className="text-sm text-muted-foreground">
              Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h2 className="text-lg sm:text-xl font-semibold">
          Organization Invites
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your organization membership invitations.
        </p>
      </div>

      {invites.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-muted">
                <Mail className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">No pending invites</h3>
            <p className="text-sm text-muted-foreground">
              You don't have any organization invitations at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {invites.map((invite: OrganizationInvite) => (
            <Card key={invite.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-full bg-primary/10 flex-shrink-0">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg break-words">
                        {invite.organization.name}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm mt-1">
                        You've been invited to join this organization
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant={invite.role === "admin" ? "default" : "secondary"}
                    className="flex items-center gap-1 text-xs"
                  >
                    <Users className="h-3 w-3" />
                    {invite.role}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    onClick={() => handleInviteAction(invite.id, "accept")}
                    disabled={processingInviteId === invite.id}
                    className="flex-1 sm:flex-none"
                    size="sm"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    {processingInviteId === invite.id
                      ? "Processing..."
                      : "Accept"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleInviteAction(invite.id, "reject")}
                    disabled={processingInviteId === invite.id}
                    className="flex-1 sm:flex-none"
                    size="sm"
                  >
                    <X className="mr-2 h-4 w-4" />
                    {processingInviteId === invite.id
                      ? "Processing..."
                      : "Decline"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
