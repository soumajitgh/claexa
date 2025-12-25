import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { SidebarProvider } from "@/components/ui/sidebar.tsx";
import { ApplicationSidebar } from "@/features/app-sidebar/ApplicationSidebar";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar.tsx";
import classNames from "classnames";
import { useDeviceBreakpoint } from "@/hooks/use-device-breakpoint";
import { Home, History, User, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Mobile navigation items - shared configuration
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

// Bottom Navigation Component
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
      if (item.to !== "/" && location.pathname.startsWith(item.to + "/")) return true;
      // Also match if the path starts with the item path and ends with the item path
      if (item.to !== "/" && location.pathname.startsWith(item.to)) {
        const remainder = location.pathname.slice(item.to.length);
        // Check if remainder is empty or starts with / or ?
        if (remainder === "" || remainder.startsWith("/") || remainder.startsWith("?")) {
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

const RootLayout: React.FC = () => {
  const { isMobile, isTablet } = useDeviceBreakpoint();

  // Strict rule: Never show sidebar on mobile or tablet devices
  const shouldShowMobileNav = isMobile || isTablet;
  const shouldHideSidebar = isMobile || isTablet;

  const FloatingTrigger: React.FC = () => {
    const { open } = useSidebar();

    // Don't render trigger on mobile/tablet
    if (shouldHideSidebar) return null;

    return (
      <div className="fixed top-2 left-2 z-50">
        <SidebarTrigger
          className={classNames(
            "p-4",
            open
              ? "text-sidebar-foreground"
              : "text-sidebar-accent-foreground border border-sidebar-border"
          )}
        />
      </div>
    );
  };

  if (shouldShowMobileNav) {
    return (
      <div className="flex flex-col">
        <Outlet />
        <div
          className={cn(
            "fixed bottom-0 inset-x-0 bg-[var(--background)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/70 border-t border-border/80 z-50"
          )}
        >
          <BottomNavigation items={mobileNavItems} />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      {/* Strict rule: Only render sidebar on desktop */}
      {!shouldHideSidebar && <ApplicationSidebar />}
      <FloatingTrigger />
      <Outlet />
    </SidebarProvider>
  );
};

export default RootLayout;
