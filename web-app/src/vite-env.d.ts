/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_FIREBASE_CONFIG_JSON?: string
    readonly VITE_API_BASE_URL?: string
    readonly VITE_PUBLIC_POSTHOG_KEY?: string
    readonly VITE_PUBLIC_POSTHOG_HOST?: string
    readonly VITE_DEPLOYMENT_TYPE?: string
    readonly VITE_REDIRECT_BASE_URL?: string
    // Threshold below which credit balance is considered low (defaults to 5 if not set)
    readonly VITE_CREDIT_LOW_THRESHOLD?: string
    // Google Identity Services One Tap client ID
    readonly VITE_GOOGLE_CLIENT_ID?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

// View Transition API TypeScript definitions
interface ViewTransition {
    finished: Promise<void>;
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
    skipTransition(): void;
}

interface Document {
    startViewTransition(callback: () => void | Promise<void>): ViewTransition;
}

interface CSSStyleDeclaration {
    viewTransitionName?: string;
}
