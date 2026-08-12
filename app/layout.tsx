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
      <head>
        {/* CJK fallback so Chinese source labels render instead of tofu boxes */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500&family=Outfit:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
