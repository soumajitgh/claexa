import { User } from "firebase/auth";

// ============================================================================
// Types
// ============================================================================

/**
 * Base authentication result
 */
export interface AuthResult {
    success: boolean;
    error: Error | null;
}

/**
 * Sign-in result with user information
 */
export interface SignInResult extends AuthResult {
    user: User | null;
}

// ============================================================================
// Service
// ============================================================================

// Note: Auth service implementation is handled by Firebase lib
// located in src/lib/firebase
