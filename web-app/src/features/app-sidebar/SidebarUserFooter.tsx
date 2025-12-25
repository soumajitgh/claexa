import { Link } from "react-router";
import { Separator } from "@/components/ui/separator.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth";
import { useSidebar } from "@/components/ui/sidebar.tsx";
import { SidebarCreditBalance } from "@/features/account/SidebarCreditBalance.tsx";

export function SidebarUserFooter() {
  const { currentUser } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();

  const getInitials = (name?: string): string => {
    if (!name || name.trim() === "") return "U";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1 && parts[0]) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (parts[0] && parts[parts.length - 1]) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return "U";
  };

  const userName = currentUser?.profile?.fullName || currentUser?.email;
  const userImage = currentUser?.profile?.avatarUrl;
  const emailPrefix = currentUser?.email
    ? currentUser.email.split("@")[0]
    : undefined;

  return (
    <>
      <Separator className="my-0.5" />
      <SidebarCreditBalance />
      <div className="p-1">
        <Link
          to="/account"
          onClick={() => isMobile && setOpenMobile(false)}
          className="flex items-center gap-2 rounded-lg p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <Avatar className="h-8 w-8">
            {userImage ? (
              <AvatarImage src={userImage} alt={userName || "User"} />
            ) : null}
            <AvatarFallback>
              {getInitials(userName || emailPrefix || "User")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {emailPrefix || "Guest"}
            </p>
          </div>
        </Link>
      </div>
    </>
  );
}
