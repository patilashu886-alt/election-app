import { Button } from "@/components/ui/button";

export function Privacy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-muted-foreground">Last updated: March 2026</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p>
            Welcome to our College Elections platform. We are committed to protecting your privacy and handling your personal information responsibly.
          </p>

          <h2 className="text-2xl font-semibold mt-10">1. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Full name</li>
            <li>Email address</li>
            <li>Student/Employee/Society/Candidate ID</li>
            <li>Profile photo (taken during biometric verification)</li>
            <li>Voting choices (anonymized and encrypted)</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To verify your identity and eligibility to vote or stand as a candidate</li>
            <li>To allow secure login and access to your dashboard</li>
            <li>To conduct fair and transparent elections</li>
            <li>To prevent duplicate voting or impersonation</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10">3. Data Sharing</h2>
          <p>
            We <strong>do not sell</strong> your personal information. We only share data:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>With college/university administration (for verification purposes only)</li>
            <li>When required by law</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10">4. Data Security</h2>
          <p>
            We use industry-standard encryption (Firebase Auth + Firestore security rules) to protect your data.
            Biometric photos are stored securely and deleted after verification where possible.
          </p>

          <h2 className="text-2xl font-semibold mt-10">5. Your Rights</h2>
          <p>
            You can request deletion of your account and data by contacting the election committee.
            Contact: [your-email@example.com] or through the platform support.
          </p>

          <h2 className="text-2xl font-semibold mt-10">6. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will notify users of major changes via email or in-app notice.
          </p>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            Thank you for using our platform responsibly.
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline" size="lg">
            <a href="/">Back to Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}