import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { AuthProvider } from "@/context/auth.tsx";
import "./index.css";
import "./theme.css";
import { reactQueryClient } from "@/api/lib/reactQuery";
import { QueryClientProvider } from "@tanstack/react-query";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { startAuthTokenListener } from "@/api/lib/auth";

// Ensure token listener starts as early as possible
startAuthTokenListener();

// Initialize PostHog
const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

if (posthogKey && posthogHost) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    defaults: "2025-05-24",
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {posthogKey && posthogHost ? (
      <PostHogProvider client={posthog}>
        <QueryClientProvider client={reactQueryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryClientProvider>
      </PostHogProvider>
    ) : (
      <QueryClientProvider client={reactQueryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    )}
    <Toaster />
  </StrictMode>
);
