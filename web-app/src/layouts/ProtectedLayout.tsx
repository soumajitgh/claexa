import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/context/auth";
import SplashLoadingView from "@/views/SplashLoadingView";

interface ProtectedRouteProps {
  redirectPath?: string;
  fallbackComponent?: React.ComponentType;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath = "/login",
  fallbackComponent: FallbackComponent = SplashLoadingView,
}) => {
  const { isAuthenticated, isLoading, error } = useAuth();
  const location = useLocation();

  // Show loading state while authentication is being checked
  if (isLoading) {
    return <FallbackComponent />;
  }

  // Handle authentication errors
  if (error) {
    // For auth errors, redirect to login with error state
    return (
      <Navigate
        to={redirectPath}
        replace
        state={{
          from: location.pathname,
          error: error.message,
          errorType: "auth",
        }}
      />
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate to={redirectPath} replace state={{ from: location.pathname }} />
    );
  }

  // Render child routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute;

// Re-export for backward compatibility
export { ProtectedRoute };
