import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Tribunal — Enterprise Claude Code Enhancement",
  description: "TDD enforcement, quality gates, and AI code review for every Claude Code session. Install in seconds.",
  metadataBase: new URL("https://tribunal.dev"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Tribunal — Enterprise Claude Code Enhancement",
    description: "TDD enforcement, quality gates, and AI code review for every Claude Code session. Install in seconds.",
    url: "https://tribunal.dev",
    siteName: "Tribunal",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Tribunal" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tribunal — Enterprise Claude Code Enhancement",
    description: "TDD enforcement, quality gates, and AI code review for every Claude Code session.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
