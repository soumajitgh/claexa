import {
  getAuth,
  onAuthStateChanged,
  signOut,
  User,
  getRedirectResult,
  signInWithRedirect,
  OAuthProvider,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { app } from "../app"; // Adjusted path
import { AuthResult, SignInResult } from "@/api";

const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).then(() =>
  console.warn("Persistence Set Successfully."),
);

/** Wrapper for Google sign-in returning high-level SignInResult */
export const signInWithGoogle = async (): Promise<SignInResult> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, success: true, error: null };
  } catch (error) {
    const typedError =
      error instanceof Error ? error : new Error(String(error));
    return { user: null, success: false, error: typedError };
  }
};

export const logoutUser = async (): Promise<AuthResult> => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    const typedError =
      error instanceof Error ? error : new Error(String(error));
    return { success: false, error: typedError };
  }
};

export const subscribeToAuthChanges = (
  callback: (user: User | null) => void,
) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentFirebaseUser = (): User | null => {
  return auth.currentUser;
};

export const getGoogleOAuthToken = async (): Promise<string | null> => {
  if (!auth.currentUser) {
    // This should ideally not happen if the user is already logged in.
    // Handle redirect sign-in if needed, or prompt user to sign in.
    // For simplicity, we'll try a redirect here.
    // Note: This might not be the best UX without prior user interaction.
    await signInWithRedirect(auth, new OAuthProvider("google.com")); // Assuming googleProvider is configured elsewhere or use new GoogleAuthProvider()
    // After redirect, the result needs to be handled on page load.
    return null; // Token will be available after redirect and page reload.
  }

  try {
    // Attempt to get the result from a redirect operation first.
    // This is useful if the page reloaded after a redirect sign-in.
    const result = await getRedirectResult(auth);
    if (result) {
      const credential = OAuthProvider.credentialFromResult(result);
      return credential?.accessToken || null;
    }
    return null; // Placeholder: Real implementation needs careful consideration of auth flows.
  } catch (error) {
    console.error("Error getting Google OAuth token", error);
    return null;
  }
};

export { auth };
export type { User };
