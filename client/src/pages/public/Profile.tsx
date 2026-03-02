import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { auth } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase"; // ← make sure you export db from firebase.ts
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";

interface FirestoreUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  identifier?: string;
  createdAt?: Date | string;
  // add any other fields you have
}

export function Profile() {
  const [user, setUser] = useState<FirestoreUser | null | undefined>(undefined);
  const [fetchStatus, setFetchStatus] = useState<
    "idle" | "loading" | "success" | "not-found" | "error" | "not-authenticated"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const loadProfile = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        setFetchStatus("not-authenticated");
        setErrorMessage("No authenticated user or email found.");
        return;
      }

      setFetchStatus("loading");

      try {
        console.log("[Profile] Searching users collection by email:", currentUser.email);

        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("email", "==", currentUser.email),
          limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("[Profile] No matching document found for email:", currentUser.email);
          setFetchStatus("not-found");
          setErrorMessage(
            t("profile.notFoundDetail") ||
              `No profile found for email: ${currentUser.email}`
          );
          return;
        }

        const docSnap = querySnapshot.docs[0];
        const userData = {
          id: docSnap.id,
          ...docSnap.data(),
        } as FirestoreUser;

        console.log("[Profile] Found profile document ID:", docSnap.id, userData);
        setUser(userData);
        setFetchStatus("success");
      } catch (err: any) {
        console.error("[Profile] Firestore error:", err);
        setFetchStatus("error");
        setErrorMessage(
          err.message ||
            t("profile.fetchFailed") ||
            "Failed to load profile from Firestore."
        );
      }
    };

    loadProfile();
  }, [t]);

  // Loading
  if (fetchStatus === "loading" || fetchStatus === "idle") {
    return (
      <div className="page-shell min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">{t("profile.loading") || "Loading your profile..."}</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (fetchStatus === "not-authenticated") {
    return (
      <div className="page-shell">
        <div className="page-container max-w-lg mx-auto py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-warning mb-4" />
          <h2 className="text-2xl font-bold mb-3">
            {t("profile.notSignedIn") || "You're not signed in"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t("profile.signInToView") || "Please sign in to view your profile."}
          </p>
          <Button onClick={() => setLocation("/login")}>
            {t("common.signIn") || "Sign In"}
          </Button>
        </div>
      </div>
    );
  }

  // Not found or error
  if (fetchStatus === "not-found" || fetchStatus === "error") {
    return (
      <div className="page-shell">
        <div className="page-container max-w-lg mx-auto py-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-3">
            {fetchStatus === "not-found"
              ? t("profile.notFound") || "Profile not found"
              : t("profile.errorLoading") || "Error loading profile"}
          </h2>

          {errorMessage && (
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">{errorMessage}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("profile.backToDashboard") || "Back to Dashboard"}
            </Button>
            <Button onClick={() => window.location.reload()}>
              {t("common.tryAgain") || "Try Again"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success – show profile
  return (
    <div className="page-shell">
      <div className="page-container max-w-2xl mx-auto py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("profile.title") || "Your Profile"}
          </h1>
          <Button variant="outline" size="sm" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back") || "Back"}
          </Button>
        </div>

        <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
          <dl className="grid grid-cols-[auto,1fr] gap-x-8 gap-y-5 text-base">
            <dt className="font-medium text-muted-foreground">{t("profile.name") || "Name"}:</dt>
            <dd className="font-medium">{user?.name || "—"}</dd>

            <dt className="font-medium text-muted-foreground">{t("profile.email") || "Email"}:</dt>
            <dd>{user?.email || "—"}</dd>

            <dt className="font-medium text-muted-foreground">{t("profile.role") || "Role"}:</dt>
            <dd className="capitalize">{user?.role || "—"}</dd>

            <dt className="font-medium text-muted-foreground">
              {t("profile.identifier") || "Identifier"}:
            </dt>
            <dd>{user?.identifier || "—"}</dd>

            {user?.createdAt && (
              <>
                <dt className="font-medium text-muted-foreground">
                  {t("profile.joined") || "Joined"}:
                </dt>
                <dd>
                  {user.createdAt instanceof Date
                    ? user.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : typeof user.createdAt === "string"
                    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}