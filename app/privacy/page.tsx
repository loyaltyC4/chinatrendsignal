import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="16 August 2026"
      sections={[
        {
          h: "What we collect",
          p: [
            "Your email address, so we can sign you in and send the weekly report if you want it. We do not ask for a password, so we never store one.",
            "Product usage: which signals you opened, which analyses you ran, and your credit ledger. This is what makes the account work and lets us show you an accurate balance.",
            "If you subscribe, our payment processor collects your billing details. We never see or store your card number.",
          ],
        },
        {
          h: "What we do not collect",
          p: [
            "We do not buy or enrich personal data about you from third parties, we do not sell your data, and we do not run advertising trackers.",
          ],
        },
        {
          h: "Where it lives",
          p: [
            "Account data is stored in a managed Postgres database hosted in Sydney, Australia. Row-level security means one account cannot read another's records.",
            "The product runs on Vercel infrastructure. Some requests are served from edge locations outside Australia.",
          ],
        },
        {
          h: "Third parties we send data to",
          p: [
            "Anthropic, when you run an analysis, so that a model can read the signal data and write the response. Product signal data is sent, and your email address is not.",
            "Our payment processor, when you subscribe, to handle billing.",
            "Our email provider, to deliver sign-in links and reports.",
          ],
        },
        {
          h: "The data we index",
          p: [
            "The signals in the radar are drawn from public platform surfaces and consist of product and engagement information. We index products and posts, not people, and we do not build profiles of platform users.",
          ],
        },
        {
          h: "Your rights",
          p: [
            "You can request a copy of your data or ask us to delete your account at any time. Deleting your account removes your profile, credit ledger and usage history.",
            "Under Australian privacy law you may also complain to the Office of the Australian Information Commissioner if you are unhappy with how we have handled your data.",
          ],
        },
        {
          h: "Cookies",
          p: [
            "One cookie for your sign-in session, and one local preference for your light or dark theme. No advertising or cross-site tracking cookies.",
          ],
        },
      ]}
    />
  );
}
