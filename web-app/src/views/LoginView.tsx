// /home/soumajit/Developer/claexa/claexa-web-app/src/views/LoginView.tsx
import React, { useEffect, useRef } from "react";
import { useAuth } from "@/context/auth";
import { useNavigate } from "react-router";
import logo from "@/assets/logo/logo-light-c.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useDeviceBreakpoint } from "@/hooks/use-device-breakpoint";
import MobileLoginView from "./MobileLoginView";
import {
  GoogleApiDisclosure,
  TermsNotice,
} from "../features/login/GoogleApiDisclosure";

// Removed inline placeholder; replaced with shared components.

// Google G Icon (from your original code)
const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path
        fill="#4285F4"
        d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
      />
      <path
        fill="#34A853"
        d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
      />
      <path
        fill="#FBBC05"
        d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
      />
      <path
        fill="#EA4335"
        d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
      />
    </g>
  </svg>
);

const LoginView: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDeviceBreakpoint();
  const postLoginPath = isMobile || isTablet ? "/" : "/";

  const handleGoogleSignIn = async () => {
    try {
      setError(null); // Clear previous errors
      if (buttonDisabled) return; // prevent double click

      setButtonDisabled(true); // Disable button during sign-in
      const { signInWithGoogle } = auth;
      const result = await signInWithGoogle();

      if (result.success && result.user) {
        navigate(postLoginPath); // device-aware redirect
      } else if (result.error) {
        console.error("Google Sign-In error:", result.error);
        setError("Failed to sign in with Google. Please try again.");
      }
    } catch (err) {
      setError(
        "An unexpected error occurred during sign-in. Please try again."
      );
      console.error("Google Sign-In error:", err);
    } finally {
      setButtonDisabled(false); // Re-enable button after sign-in attempt
    }
  };

  // Attempt One Tap on mount if user isn't authenticated and client ID configured
  const promptedRef = useRef(false);
  useEffect(() => {
    if (promptedRef.current) return;
    promptedRef.current = true;

    // For now, disable One Tap functionality until properly implemented
    // The Google One Tap requires additional setup with the Google Identity Services API
    // Currently only the basic sign-in with popup is implemented

    return () => {
      // Cleanup function - no cancellation needed for disabled One Tap
    };
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the user becomes authenticated (via One Tap or otherwise), redirect to home
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate(postLoginPath, { replace: true });
    }
  }, [auth.isAuthenticated, navigate, postLoginPath]);

  // Shared sign-in handler used by both variants
  const onGoogleSignIn = async () => {
    await handleGoogleSignIn();
  };

  if (isMobile) {
    return (
      <MobileLoginView
        onGoogleSignIn={onGoogleSignIn}
        loading={buttonDisabled}
        error={error}
      />
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[var(--background)]">
      {/* Centered Auth Card */}
      <div className="w-full max-w-md">
        <Card className="w-full px-6 pt-9 pb-9">
          <CardHeader className="text-center px-6 mb-9">
            <div className="mx-auto flex items-center justify-center gap-2">
              <img src={logo} alt="Claexa AI" className="h-8 w-8" />
              <span className="text-xl font-bold text-foreground">
                Claexa AI
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-6 space-y-9">
            <h2 className="text-center text-3xl font-semibold text-foreground whitespace-nowrap">
              Sign in to Claexa AI
            </h2>
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              size="lg"
              className="w-full h-11 font-semibold"
              disabled={buttonDisabled}
            >
              <GoogleIcon className="h-4 w-4" />
              <span>Continue with Google</span>
            </Button>

            {error && (
              <div className="text-red-600 text-xs text-center p-2 bg-red-50 rounded-md w-full">
                {error}
              </div>
            )}

            <GoogleApiDisclosure />
          </CardContent>
        </Card>
        <TermsNotice className="mt-4" />
      </div>

      {/* Founders button removed as requested */}
    </div>
  );
};

export default LoginView;
