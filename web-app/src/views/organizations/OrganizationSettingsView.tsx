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
import { Input } from "@/components/ui/input";
import { Loader2, Settings } from "lucide-react";

const OrganizationSettingsView: React.FC = () => {
  // Fetch organization profile
  const { data: orgProfile, isLoading } = useQuery({
    queryKey: ["organizationProfile"],
    queryFn: async () => {
      const response = await api.organization.getOrganizationProfile();
      if (!response.success) {
        throw new Error("Failed to fetch organization profile");
      }
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Organization Settings</h2>

      {/* Organization Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Organization Settings
          </CardTitle>
          <CardDescription>Update your organization settings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orgProfile ? (
            <form className="space-y-6">
              <div className="grid gap-2">
                <label htmlFor="orgName" className="text-sm font-medium">
                  Organization Name
                </label>
                <Input id="orgName" defaultValue={orgProfile.name} disabled />
                <p className="text-sm text-muted-foreground mt-1">
                  Contact support to change your organization name
                </p>
              </div>

              <div className="grid gap-2">
                <label htmlFor="orgId" className="text-sm font-medium">
                  Organization ID
                </label>
                <Input id="orgId" value={orgProfile.orgId} readOnly disabled />
                <p className="text-sm text-muted-foreground mt-1">
                  This is your unique organization identifier
                </p>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Unable to load organization information
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationSettingsView;
