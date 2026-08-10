import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "China Trend Signal — the trend radar for cross-border sellers",
  description:
    "We watch Douyin, Xiaohongshu, 1688 and Xingtu so you find the product, the factory price, and the creator rate card — weeks before the trend reaches TikTok.",
  openGraph: {
    title: "China Trend Signal",
    description:
      "Find the product, the factory price, and the creator rate card — weeks before the trend reaches TikTok.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
