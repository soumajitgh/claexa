/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Building2,
  Clock,
  LayoutDashboard,
  Loader2,
  Shield,
  Users,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/context/auth";

const OrganizationOverviewView: React.FC = () => {
  const { currentUser } = useAuth();
  const organizationApi = api.organization as any;

  // Get current organization ID
  const organizationId = currentUser?.activeOrganization?.id;

  // Fetch organization profile
  const { data: orgProfile, isLoading: isOrgLoading } = useQuery({
    queryKey: ["organizationProfile"],
    queryFn: async () => {
      const response = await organizationApi.profile();
      if (!response.success) {
        throw new Error("Failed to fetch organization profile");
      }
      // Add default userRole to handle API response without it
      return {
        ...response.data,
        userRole: response.data.userRole || "admin", // Default to admin if not provided
      };
    },
  });

  // Fetch organization members count using organization-specific endpoint
  const { data: membersData, isLoading: isMembersLoading } = useQuery({
    queryKey: ["organizationMembers", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("No organization ID available");
      }

      const response = await organizationApi.members.byOrgId(organizationId);
      if (!response.success) {
        throw new Error("Failed to fetch organization members");
      }

      // Transform the response data to match the expected format
      const members = response.data.map((member: any) => ({
        ...member,
        // Ensure all required properties are present
        fullName: member.fullName || member.email.split("@")[0] || "",
        status: member.status || "active",
        avatarUrl: member.avatarUrl || "",
      }));

      return {
        members,
        totalCount: members.length,
        activeCount: members.filter((m: any) => m.status === "active").length,
      };
    },
    enabled: !!organizationId,
  });

  // Fetch organization invites using organization-specific endpoint
  const { data: invitesData, isLoading: isInvitesLoading } = useQuery({
    queryKey: ["organizationInvites", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        throw new Error("No organization ID available");
      }

      const response = await organizationApi.invites.byOrgId(organizationId);
      if (!response.success) {
        throw new Error("Failed to fetch organization invites");
      }
      return response.data;
    },
    enabled: !!organizationId,
  });

  const isLoading = isOrgLoading || isMembersLoading || isInvitesLoading;

  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-1.5">
        <h2 className="text-2xl font-bold">Organization Overview</h2>
        <p className="text-muted-foreground">
          Manage and monitor your organization details
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard
          title="Total Members"
          value={isLoading ? undefined : membersData?.totalCount || 0}
          icon={<Users className="h-5 w-5 text-blue-500" />}
          trend={{
            type: "positive",
            text: "All",
          }}
        />

        <StatsCard
          title="Active Members"
          value={isLoading ? undefined : membersData?.activeCount || 0}
          icon={<UserCheck className="h-5 w-5 text-green-500" />}
          trend={{
            type: "positive",
            text: "Ready to contribute",
          }}
        />

        <StatsCard
          title="Pending Invites"
          value={isLoading ? undefined : invitesData?.length || 0}
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          trend={{
            type: "neutral",
            text: "Awaiting responses",
          }}
        />
      </div>

      {/* Organization Profile Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-5 w-5" />
            Organization Details
          </CardTitle>
          <CardDescription>
            Comprehensive information about your organization
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isOrgLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orgProfile ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">{orgProfile.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    ID: {orgProfile.orgId}
                  </p>
                </div>
                <Badge
                  variant={
                    orgProfile.status === "active"
                      ? "default"
                      : orgProfile.status === "inactive"
                      ? "secondary"
                      : orgProfile.status === "suspended"
                      ? "destructive"
                      : "outline"
                  }
                  className="px-3 py-1"
                >
                  {orgProfile.status?.charAt(0).toUpperCase() +
                    orgProfile.status?.slice(1) || "Unknown"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Your Role
                  </p>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium">
                      {orgProfile.userRole?.charAt(0).toUpperCase() +
                        orgProfile.userRole?.slice(1) || "Member"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Member Count
                  </p>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium">
                      {membersData?.totalCount || 0} Team Members (
                      {membersData?.activeCount || 0} Active)
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending Invites
                  </p>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium">
                      {invitesData?.length || 0} Pending Responses
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium">
                      {orgProfile.status?.charAt(0).toUpperCase() +
                        orgProfile.status?.slice(1) || "Unknown"}{" "}
                      Account
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <LayoutDashboard className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="font-medium">
                Unable to load organization information
              </p>
              <p className="text-sm">
                Please try again later or contact support
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value?: number;
  icon: React.ReactNode;
  trend: {
    type: "positive" | "negative" | "neutral";
    text: string;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <h2 className="text-3xl font-bold">
                {value !== undefined ? (
                  value
                ) : (
                  <Loader2 className="h-6 w-6 animate-spin text-primary inline" />
                )}
              </h2>
              <Badge
                variant={trend.type === "positive" ? "outline" : "secondary"}
                className="bg-primary/10 text-xs"
              >
                {trend.text}
              </Badge>
            </div>
          </div>
          <div className="rounded-full p-2.5 bg-muted">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationOverviewView;
