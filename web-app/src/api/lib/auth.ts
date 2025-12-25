import { getAuth, onIdTokenChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase/app';

type Subscriber = () => void;
let currentToken: string | null = null;
let initialized = false;
let isUpdating = false;
const subscribers = new Set<Subscriber>();

async function updateToken(user: User | null) {
    // Prevent race conditions with concurrent updates
    if (isUpdating) return;
    isUpdating = true;

    try {
        const newToken = user ? await user.getIdToken() : null;
        const changed = newToken !== currentToken;
        currentToken = newToken;
        
        if (changed) {
            notify();
        }
    } catch (error) {
        console.error('Failed to update auth token:', error);
        const wasAuthenticated = currentToken !== null;
        currentToken = null;
        if (wasAuthenticated) {
            notify(); // Only notify if we lost authentication
        }
    } finally {
        isUpdating = false;
    }
}

function notify() {
    subscribers.forEach((fn) => {
        try { fn(); } catch {
            console.error("Error notifying auth token subscriber", fn);
        }
    });
}

/**
 * Start token listener to keep sync token updated
 */
export async function startAuthTokenListener() {
    if (initialized) return;
    initialized = true;
    const auth = getAuth(app);

    // Prime token if a user already exists - await to ensure initial state is set
    await updateToken(auth.currentUser);

    onIdTokenChanged(auth, async (user) => {
        await updateToken(user);
    });
}

/**
 * Get auth token synchronously (preferred for performance)
 */
export function getAuthTokenSync(): string | null {
    return currentToken;
}

/**
 * Subscribe to auth token changes
 */
export function subscribeAuthToken(cb: Subscriber): () => void {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
}

/**
 * Get auth token asynchronously (uses cached token with fallback to fresh fetch)
 */
export const getAuthToken = async (): Promise<string | null> => {
    // First try to use cached token for performance
    if (currentToken) {
        return currentToken;
    }

    // Fallback to fresh token if cache is empty
    try {
        const auth = getAuth(app);
        const freshToken = await auth.currentUser?.getIdToken() ?? null;
        // Update cache with fresh token
        if (freshToken) {
            currentToken = freshToken;
        }
        return freshToken;
    } catch (error) {
        console.error('Failed to get fresh auth token:', error);
        return null;
    }
};



/**
 * Get the latest token from Firebase for API requests
 * Firebase handles token caching and refreshing internally
 */
export const getTokenForRequest = async (): Promise<string | null> => {
    try {
        const auth = getAuth(app);
        const user = auth.currentUser;
        
        if (!user) {
            return null;
        }

        // Let Firebase handle token caching and refresh logic
        // It will return cached token if valid, or refresh automatically if needed
        return await user.getIdToken();
    } catch (error) {
        console.error('Failed to get token from Firebase:', error);
        return null;
    }
};

/**
 * Get auth headers (uses consistent token source)
 */
export const getAuthHeader = async (): Promise<Record<string, string>> => {
    const token = await getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};
