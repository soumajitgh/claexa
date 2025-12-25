import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar.tsx";
import { Link, useLocation } from "react-router";
import logo from "@/assets/logo/logo-light-c.png";
import { useMemo } from "react";
import { getActiveFeature, features } from "./feature";
import { FeatureHistorySwitch } from "./FeatureHistorySwitch";
import { SidebarUserFooter } from "./SidebarUserFooter";
import { useDeviceBreakpoint } from "@/hooks/use-device-breakpoint";

export function ApplicationSidebar() {
  const { setOpenMobile } = useSidebar();
  const { isMobile, isTablet } = useDeviceBreakpoint();
  const location = useLocation();
  const activeFeature = useMemo(
    () => getActiveFeature(location.pathname),
    [location.pathname]
  );
  const aiQPActive = activeFeature === "questionPaper";
  const solverActive = activeFeature === "solver";

  const menu = useMemo(
    () =>
      features.map((f) => ({
        ...f,
        active: f.key === "questionPaper" ? aiQPActive : solverActive,
      })),
    [aiQPActive, solverActive]
  );

  // Strict safeguard: Never render sidebar on mobile or tablet
  if (isMobile || isTablet) {
    return null;
  }

  return (
    <Sidebar>
      {/* Header */}
      <SidebarHeader className="h-12">
        <div className={`flex items-center h-full justify-center`}>
          <img src={logo} alt="Claexa AI Logo" className="mr-2 w-6 h-6" />
          <p className="text-lg font-semibold">Claexa AI</p>
        </div>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent className="overflow-x-hidden items-center">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((f) => (
                <SidebarMenuItem key={f.key}>
                  <SidebarMenuButton
                    asChild
                    isActive={f.active}
                    onClick={() => isMobile && setOpenMobile(false)}
                  >
                    <Link to={f.to}>
                      <f.icon className="h-4 w-4" />
                      <span>{f.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <FeatureHistorySwitch
          feature={activeFeature}
          isMobile={isMobile}
          onCloseMobile={() => setOpenMobile(false)}
        />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        <SidebarUserFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
