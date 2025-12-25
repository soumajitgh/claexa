import { Button } from "@/components/ui/button.tsx";
import {
  ArrowLeft,
  User,
  Building2,
  Home,
  History,
  LucideIcon,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { useAuth } from "@/context/auth";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Card, CardContent } from "@/components/ui/card.tsx";
import { useDeviceBreakpoint } from "@/hooks/use-device-breakpoint";
import { cn } from "@/lib/utils";

// Mobile navigation items - same as RootLayout
interface MobileNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const mobileNavItems: MobileNavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/mobile/history", label: "History", icon: History },
  { to: "/account", label: "Profile", icon: User },
];

// Bottom Navigation Component - Same as RootLayout for consistency
interface BottomNavigationProps {
  items: MobileNavItem[];
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ items }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Find the best matching item (most specific match)
  // Sort by path length descending to match most specific route first
  const activeItem = [...items]
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => {
      // Exact match
      if (location.pathname === item.to) return true;
      // Nested route match (only if there's actually a slash after)
      if (item.to !== "/" && location.pathname.startsWith(item.to + "/"))
        return true;
      // Also match if the path starts with the item path and ends with the item path
      if (item.to !== "/" && location.pathname.startsWith(item.to)) {
        const remainder = location.pathname.slice(item.to.length);
        // Check if remainder is empty or starts with / or ?
        if (
          remainder === "" ||
          remainder.startsWith("/") ||
          remainder.startsWith("?")
        ) {
          return true;
        }
      }
      return false;
    });

  return (
    <nav className="flex items-center justify-around px-4 py-2 h-16">
      {items.map((item) => {
        const isActive = activeItem?.to === item.to;
        const Icon = item.icon;

        return (
          <button
            key={item.to}
            onClick={() => navigate(item.to)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 ease-out min-w-[64px]",
              "hover:bg-accent/50 active:scale-95",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div
              className={cn(
                "relative transition-all duration-300",
                isActive && "scale-110"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isActive && "stroke-[2.5px]"
                )}
              />
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-in zoom-in duration-300" />
              )}
            </div>
            <span
              className={cn(
                "text-xs font-medium transition-all duration-300",
                isActive ? "opacity-100 scale-100" : "opacity-70 scale-95"
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export function AccountLayout() {
  const { currentUser, logout: handleLogout } = useAuth();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDeviceBreakpoint();

  // Show mobile nav on mobile/tablet devices
  const shouldShowMobileNav = isMobile || isTablet;

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

  const userName = currentUser?.profile.fullName || currentUser?.email;
  const userEmail = currentUser?.email;
  const userImage = currentUser?.profile?.avatarUrl;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 sm:py-8 px-4 md:px-6 lg:px-8 max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-start">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              await handleLogout();
              navigate("/");
            }}
          >
            Sign Out
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 items-start">
          {/* Left Sidebar / User Info */}
          <div className="w-full lg:w-1/4 flex flex-col gap-4 sm:gap-8">
            <Card className="bg-muted/50">
              <CardContent className="flex flex-row lg:flex-col items-center lg:items-center gap-4 p-4 sm:p-6">
                <Avatar className="h-12 w-12 sm:h-16 sm:w-16 lg:h-24 lg:w-24 flex-shrink-0">
                  {userImage && (
                    <AvatarImage src={userImage} alt={userName || "User"} />
                  )}
                  <AvatarFallback className="text-lg sm:text-xl lg:text-3xl">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 lg:flex-none text-left lg:text-center">
                  <h1 className="text-base sm:text-lg lg:text-2xl font-bold">
                    {userName || "User Profile"}
                  </h1>
                  {userEmail && (
                    <p className="text-muted-foreground text-xs sm:text-sm lg:text-sm">
                      {userEmail}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Desktop Navigation - Hidden on mobile to prevent duplicate profile buttons */}
            <nav className="hidden lg:flex lg:flex-col gap-2">
              <Button
                variant={
                  !location.pathname.includes("/organizations")
                    ? "default"
                    : "outline"
                }
                onClick={() => navigate("")}
                className="w-full text-left justify-start"
                size="sm"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
              {/* Show Organizations button only if user is admin of current organization */}
              {currentUser?.activeOrganization?.role === "admin" && (
                <Button
                  variant={
                    location.pathname.includes("/organizations")
                      ? "default"
                      : "outline"
                  }
                  onClick={() => navigate("organizations")}
                  className="w-full text-left justify-start"
                  size="sm"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Organizations
                </Button>
              )}
            </nav>
          </div>

          {/* Right Content / Tabs - Rendered by children */}
          <div className="w-full lg:w-3/4">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar - Same as RootLayout */}
      {shouldShowMobileNav && (
        <div
          className={cn(
            "fixed bottom-0 inset-x-0 bg-[var(--background)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/70 border-t border-border/80 z-50"
          )}
        >
          <BottomNavigation items={mobileNavItems} />
        </div>
      )}
    </div>
  );
}
