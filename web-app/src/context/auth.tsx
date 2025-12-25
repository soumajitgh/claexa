import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import {
  logoutUser,
  subscribeToAuthChanges,
  User as FirebaseUser,
} from "@/lib/firebase";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { AuthResult, SignInResult, UserResponse, accountService } from "@/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthTokenSync, subscribeAuthToken } from "@/api/lib/auth";

// Constants
const USER_CACHE_KEY = "claexai_user_cache";

// Helper functions for user cache
const getCachedUser = (): UserResponse | null => {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed.data;
    }
  } catch (error) {
    console.error("Error reading cached user:", error);
  }
  return null;
};

const setCachedUser = (user: UserResponse): void => {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify({
      data: user,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error("Error caching user:", error);
  }
};

const clearCachedUser = (): void => {
  try {
    localStorage.removeItem(USER_CACHE_KEY);
  } catch (error) {
    console.error("Error clearing cached user:", error);
  }
};

// Types
export interface AuthContextType {
  currentUser: UserResponse | null;
  isLoading: boolean;
  error: Error | null;
  signInWithGoogle: () => Promise<SignInResult>;
  logout: () => Promise<AuthResult>;
  isAuthenticated: boolean;
  isUserLoading: boolean;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState<boolean>(false);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Force re-render when token changes
  const [tokenVersion, setTokenVersion] = useState(0);
  const hasToken = useMemo(() => !!getAuthTokenSync(), [tokenVersion]);

  useEffect(() => {
    const unsubscribeToken = subscribeAuthToken(() => {
      setTokenVersion((v) => v + 1);
    });
    return unsubscribeToken;
  }, []);

  // Check if user is authenticated
  const isAuthenticated = isFirebaseInitialized && !!firebaseUser && hasToken;

  // React Query for user data
  const {
    data: currentUser,
    isLoading: isUserQueryLoading,
    error: userQueryError,
    refetch: refetchUser,
  } = useQuery<UserResponse, Error>({
    queryKey: ["userMe", firebaseUser?.uid],
    queryFn: async () => {
      try {
        const response = await accountService.getMe();

        if (!response.success) {
          throw new Error("Failed to fetch user data from API");
        }

        // Update localStorage cache as backup
        setCachedUser(response.data);

        return response.data;
      } catch (error: any) {
        // Clear cache on auth errors
        if (error?.response?.status === 401 || error?.message?.includes("unauthorized")) {
          clearCachedUser();
          queryClient.removeQueries({ queryKey: ["userMe"] });
        }
        throw error;
      }
    },
    enabled: isAuthenticated,
    // Use cached data from localStorage as initial data
    initialData: () => {
      if (isAuthenticated) {
        const cached = getCachedUser();
        // Only use cache if it exists and is less than 1 hour old
        if (cached) {
          try {
            const cacheData = localStorage.getItem(USER_CACHE_KEY);
            if (cacheData) {
              const { timestamp } = JSON.parse(cacheData);
              const ONE_HOUR = 60 * 60 * 1000;
              if (Date.now() - timestamp < ONE_HOUR) {
                return cached;
              } else {
                // Cache expired, clear it
                clearCachedUser();
              }
            }
          } catch {
            // Invalid cache, clear it
            clearCachedUser();
          }
        }
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab after 10-20 min
    refetchOnReconnect: true, // Refetch when internet reconnects
    refetchOnMount: "always", // Always check on mount to prevent stale data
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors (token expired)
      if (
        error?.response?.status === 401 ||
        error?.message?.includes("unauthorized") ||
        error?.message?.includes("token")
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Refetch user data when user comes back after being away
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isAuthenticated) {
        // Firebase handles token refresh automatically
        // Just refetch user data to ensure it's current
        refetchUser();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isAuthenticated, refetchUser]);

  // Subscribe to Firebase auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((fbUser) => {
      setFirebaseUser(fbUser);
      setIsFirebaseInitialized(true);

      if (!fbUser) {
        // Clear everything on logout
        queryClient.removeQueries({ queryKey: ["userMe"] });
        clearCachedUser();
        setAuthError(null);
      }
    });

    return unsubscribe;
  }, [queryClient]);



  const handleSignInWithGoogle = useCallback(async (): Promise<SignInResult> => {
    try {
      setAuthError(null);

      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      return { user: result.user, success: true, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setAuthError(error);

      return { user: null, success: false, error };
    }
  }, []);

  const handleLogout = useCallback(async (): Promise<AuthResult> => {
    try {
      setAuthError(null);

      // Clear cached user data
      clearCachedUser();

      // Clear queries
      queryClient.removeQueries({ queryKey: ["userMe"] });
      queryClient.clear();

      const result = await logoutUser();

      if (!result.success) {
        setAuthError(result.error as Error);
      }

      return result;
    } catch (err) {
      const error = err as Error;
      setAuthError(error);

      return { success: false, error };
    }
  }, [queryClient]);

  const contextValue = useMemo((): AuthContextType => {
    // Simple loading logic:
    // - Loading if Firebase not initialized
    // - Loading if authenticated but no user data yet (and query is running without error)
    const isLoading =
      !isFirebaseInitialized ||
      (isAuthenticated && !currentUser && isUserQueryLoading && !userQueryError);

    const combinedError = authError || userQueryError;

    return {
      currentUser: currentUser ?? null,
      isLoading,
      error: combinedError,
      signInWithGoogle: handleSignInWithGoogle,
      logout: handleLogout,
      isAuthenticated,
      isUserLoading: isUserQueryLoading,
    };
  }, [
    isFirebaseInitialized,
    isAuthenticated,
    currentUser,
    isUserQueryLoading,
    userQueryError,
    authError,
    handleSignInWithGoogle,
    handleLogout,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthContext };