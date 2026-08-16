import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://chinatrendsignal.vercel.app"),
  title: {
    default: "China Trend Signal: the trend radar for cross-border sellers",
    template: "%s · China Trend Signal",
  },
  description:
    "We watch Douyin, Xiaohongshu and 1688 so you find the product and the factory price weeks before the trend reaches TikTok Shop. Every signal carries the date we first saw it.",
  openGraph: {
    title: "China Trend Signal",
    description:
      "Find the product and the factory price weeks before the trend reaches TikTok Shop. Every signal timestamped.",
    type: "website",
    siteName: "China Trend Signal",
  },
  twitter: { card: "summary_large_image", title: "China Trend Signal" },
  robots: { index: true, follow: true },
};

/**
 * Applies the stored theme before first paint. Without this, a dark-mode user sees
 * a full-brightness flash on every navigation, which on a near-black theme is
 * genuinely unpleasant.
 *
 * Fonts are self-hosted via the `geist` package rather than a Google Fonts <link>:
 * no render-blocking third-party request, no layout shift, no external dependency.
 * The CJK fallback is handled in the font stack, since Chinese product terms appear
 * throughout the radar.
 */
const THEME_SCRIPT = `
(function(){
  try {
    var s = localStorage.getItem('cts-theme');
    var m = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', s || (m ? 'dark' : 'light'));
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="antialiased">
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
