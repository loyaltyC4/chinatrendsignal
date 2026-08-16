import type { Metadata } from "next";
import LegalPage from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      updated="16 August 2026"
      sections={[
        {
          h: "What the service is",
          p: [
            "China Trend Signal indexes publicly available engagement and listing data from Chinese platforms including Douyin, Xiaohongshu and 1688, and presents it alongside timestamps recording when we first observed each signal.",
            "We provide information, not advice. Nothing in the product is a recommendation to buy, import or resell any item, and you remain responsible for your own commercial, customs and compliance decisions.",
          ],
        },
        {
          h: "What we do and do not claim about the data",
          p: [
            "Engagement figures are read from public platform surfaces at the time shown. Values we calculate rather than observe are labelled as estimated in the interface. Values we do not have are shown as a dash and are never filled in with a guess.",
            "We do not estimate store revenue, and any figure presented as a spread or margin is inferred from wholesale pricing rather than measured from actual sales.",
            "Upstream platforms change without notice. We do not warrant that the data is complete, current or uninterrupted.",
          ],
        },
        {
          h: "Accounts",
          p: [
            "You sign in with an email link. You are responsible for keeping access to that mailbox secure. One account is for one person unless you are on a plan that includes additional seats.",
          ],
        },
        {
          h: "Billing and credits",
          p: [
            "Paid plans are billed monthly in Australian dollars, inclusive of GST. You can cancel at any time from the billing portal and cancellation takes effect immediately, with access continuing to the end of the paid period.",
            "Credits purchased or granted do not expire. If the service is unavailable, your credit balance is unaffected and remains available when service resumes.",
          ],
        },
        {
          h: "Acceptable use",
          p: [
            "Do not resell or redistribute the raw data, attempt to circumvent rate limits, or use automated means to extract the index in bulk. Doing so may result in suspension.",
          ],
        },
        {
          h: "Liability",
          p: [
            "To the extent permitted by law, our liability is limited to the fees you paid in the three months preceding a claim. Nothing here excludes rights you have under Australian Consumer Law.",
          ],
        },
        {
          h: "Contact",
          p: ["Questions about these terms can be sent to the address listed on our contact page."],
        },
      ]}
    />
  );
}
