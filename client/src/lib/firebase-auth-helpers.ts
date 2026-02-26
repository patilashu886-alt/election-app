import { auth } from "./firebase";
import { 
  sendEmailVerification as firebaseSendEmailVerification,
  User,
  reload
} from "firebase/auth";

/**
 * Send email verification to the current user
 */
export async function sendEmailVerification(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user logged in. Please sign up first.");
  }

  if (!user.email) {
    throw new Error("User account has no email address.");
  }

  console.log(`Sending verification email to: ${user.email}`);

  try {
    // Firebase sends the verification email automatically
    await firebaseSendEmailVerification(user, {
      url: `${window.location.origin}/dashboard?emailVerified=true`,
      handleCodeInApp: false,
    });
    console.log("Verification email sent successfully");
  } catch (err: any) {
    console.error("Failed to send verification email:", err);
    const errorCode = err?.code || "unknown";
    const errorMsg = err?.message || "Unknown error";
    
    if (errorCode === "auth/too-many-requests") {
      throw new Error("Too many requests. Please wait a few minutes before retrying.");
    } else if (errorCode === "auth/invalid-email") {
      throw new Error("Invalid email address.");
    } else if (errorCode === "auth/user-disabled") {
      throw new Error("This user account has been disabled.");
    }
    
    throw new Error(`Email verification failed: ${errorMsg}`);
  }
}

/**
 * Check if current user's email is verified
 */
export async function isEmailVerified(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) {
    console.log("No user logged in");
    return false;
  }

  try {
    // Reload user to get latest verification status from Firebase
    await reload(user);
    console.log(`Email verification status: ${user.emailVerified}`);
    return user.emailVerified;
  } catch (err) {
    console.error("Error checking email verification:", err);
    return false;
  }
}

/**
 * Listen to email verification status changes
 * Returns unsubscribe function
 */
export function onEmailVerificationCheck(
  callback: (isVerified: boolean) => void
): () => void {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        await reload(user);
        callback(user.emailVerified);
      } catch (err) {
        console.error("Error reloading user:", err);
        callback(false);
      }
    } else {
      callback(false);
    }
  });

  return unsubscribe;
}

