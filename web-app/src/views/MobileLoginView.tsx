import React from "react";
import illustration from "@/assets/bg-mobile.webp";
import { Button } from "@/components/ui/button";
import {
  GoogleApiDisclosure,
  TermsNotice,
} from "../features/login/GoogleApiDisclosure";
// Auth context not directly needed here; parent passes handler

// Separate Google icon for reuse
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

interface MobileLoginViewProps {
  onGoogleSignIn: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

/**
 * Mobile / tablet focused login screen matching provided wireframe.
 * Layout uses theme CSS variables for consistent theming.
 */
export const MobileLoginView: React.FC<MobileLoginViewProps> = ({
  onGoogleSignIn,
  loading,
  error,
}) => {
  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] px-4 py-8 grid grid-rows-[auto_1fr_auto] gap-6">
      {/* Heading (top row) */}
      <div className="text-center mt-1">
        <h1 className="text-3xl font-bold tracking-tight">Claexa AI</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-[22ch] mx-auto leading-snug">
          No. 1 AI tool trusted by 1K+ students and teachers
        </p>
      </div>

      {/* Illustration occupies all space between heading and actions */}
      <div className="relative flex items-center justify-center overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={illustration}
            alt="Claexa city illustration"
            className="w-[92vw] max-w-[660px] h-full max-h-full object-contain select-none transition-all duration-300 md:w-[68vw]"
            style={{
              padding: "0.15rem",
            }}
            draggable={false}
            loading="eager"
          />
        </div>
      </div>

      {/* Actions (bottom row) */}
      <div className="w-full mx-auto flex flex-col gap-4 pb-2 self-end">
        <Button
          onClick={onGoogleSignIn}
          disabled={loading}
          variant="outline"
          size="lg"
          className="w-full h-12 font-semibold flex items-center gap-2 bg-[var(--card)] border-[var(--border)] focus-visible:ring-[var(--ring)]"
          aria-label="Sign in with Google"
        >
          <GoogleIcon className="h-5 w-5" />
          <span className="text-sm">Continue with Google</span>
        </Button>
        {error && (
          <div className="mt-1 text-center text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}
        <GoogleApiDisclosure className="bg-[oklch(0.9608_0.015_240)] border-[var(--border)]" />
        <TermsNotice className="text-[10px]" />
      </div>
    </div>
  );
};

export default MobileLoginView;
