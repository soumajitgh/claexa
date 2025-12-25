import React from "react";
import { Outlet, Navigate } from "react-router";
import { useDeviceBreakpoint } from "@/hooks/use-device-breakpoint";

/**
 * MobileOnlyLayout - A layout that only allows mobile and tablet devices
 * Desktop users are automatically redirected to the home page
 */
const MobileOnlyLayout: React.FC = () => {
  const { isMobile, isTablet } = useDeviceBreakpoint();

  // Allow access only for mobile and tablet devices
  const isMobileOrTablet = isMobile || isTablet;

  // Redirect desktop users to home page
  if (!isMobileOrTablet) {
    return <Navigate to="/" replace />;
  }

  // Render the nested routes for mobile/tablet users
  return <Outlet />;
};

export default MobileOnlyLayout;
