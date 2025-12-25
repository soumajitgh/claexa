import { useAuth } from "@/context/auth";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
// Removed delete account dialog + danger zone per requirement
import { EditProfileDialog } from "./EditProfileDialog";
import { UserResponse } from "@/api/account";

// Loading skeleton component
const AccountInfoSkeleton = () => (
  <>
    <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-0">
      <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 sm:h-4 w-[200px] sm:w-[250px]" />
        <Skeleton className="h-3 sm:h-4 w-[150px] sm:w-[200px]" />
      </div>
    </div>
    <div className="space-y-2 pt-4">
      <Skeleton className="h-3 sm:h-4 w-full" />
      <Skeleton className="h-3 sm:h-4 w-full" />
      <Skeleton className="h-3 sm:h-4 w-3/4" />
    </div>
  </>
);

// User details display component
const UserDetails = ({ currentUser }: { currentUser: UserResponse }) => (
  <div className=" border rounded-lg p-3 sm:p-4 grid grid-cols-1 gap-3 sm:gap-4">
    <div className="space-y-2">
      <div>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5">
          Full Name
        </p>
        <p className="text-sm sm:text-base font-medium">
          {currentUser.profile.fullName || "Not Provided"}
        </p>
      </div>
      <div>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5">
          Email Address
        </p>
        <p className="text-sm sm:text-base font-medium break-all">
          {currentUser.email || "Not Provided"}
        </p>
      </div>
      {currentUser.activeOrganization && (
        <div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-0.5">
            Current Organization
          </p>
          <div className="space-y-1.5">
            <p className="text-sm sm:text-base font-medium">
              {currentUser.activeOrganization.name}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">
                Role:
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  currentUser.activeOrganization.role === "admin"
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-gray-100 text-gray-700 border border-gray-200"
                }`}
              >
                {currentUser.activeOrganization.role === "admin"
                  ? "Admin"
                  : "Member"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

// Error state component
const AccountErrorState = () => (
  <div className="border rounded-lg p-3 sm:p-4">
    <p className="text-center text-muted-foreground">
      Could not load user information.
    </p>
  </div>
);

export function AccountInfo() {
  const { currentUser, isUserLoading } = useAuth();
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className={"flex flex-col gap-3 sm:gap-5 items-start"}>
        <div className="space-y-0.5 sm:space-y-1">
          <h2 className={"text-lg sm:text-xl font-bold"}>
            Account Information
          </h2>
          <p className={"text-xs sm:text-sm text-muted-foreground"}>
            View and manage your account details.
          </p>
        </div>

        <div className="space-y-2 sm:space-y-3 w-full">
          {isUserLoading ? (
            <AccountInfoSkeleton />
          ) : currentUser ? (
            <UserDetails currentUser={currentUser} />
          ) : (
            <AccountErrorState />
          )}
        </div>
      </div>

      <Separator />

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
      />
    </div>
  );
}
