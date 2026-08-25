import type { Metadata } from "next";
import OnboardingFlow from "@/components/onboarding-flow";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Set up your China Trend Signal profile.",
};

// Public route — the answers aren't wired to the profiles table yet (a later
// pass will do that server-side). Anyone can preview the flow without signing
// in first, which is what the landing page's Get Started button expects.
export const dynamic = "force-static";

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
