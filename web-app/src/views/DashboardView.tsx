import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "@/context/auth";
import { useDeviceBreakpoint } from "@/hooks/use-device-breakpoint";
import MobileDashboardView from "./MobileDashboardView";

const DashboardView: React.FC = () => {
  const { currentUser } = useAuth();
  const { isMobile, isTablet, initialized } = useDeviceBreakpoint();
  const isSmallDevice = isMobile || isTablet;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Loading dashboard...
      </div>
    );
  }

  // Avoid a brief flash before breakpoint hook initializes client-side
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Preparing dashboard...
      </div>
    );
  }

  // Mobile/Tablet: Render MobileDashboardView
  if (isSmallDevice) {
    return <MobileDashboardView />;
  }

  // Desktop: Redirect to /question-paper
  return <Navigate to="/question-paper" replace />;
};

export default DashboardView;
