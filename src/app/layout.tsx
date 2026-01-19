import type { Metadata } from "next";
import { Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  weight: ["400", "500", "700"],
  variable: "--font-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://indie-tracker.vercel.app'),
  title: "Indie Radar - Find Viral Indie Games Before They Blow Up",
  description: "Discover trending indie games before they go mainstream. Real-time scanning of Steam, itch.io, and gaming news. Find your next YouTube video topic.",
  keywords: ["indie games", "trending games", "viral games", "steam", "itch.io", "game discovery", "youtube gaming", "gaming news"],
  authors: [{ name: "Indie Radar" }],
  creator: "Indie Radar",
  publisher: "Indie Radar",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://indie-tracker.vercel.app",
    siteName: "Indie Radar",
    title: "Indie Radar - Find Viral Indie Games Before They Blow Up",
    description: "Discover trending indie games before they go mainstream. Real-time scanning of Steam, itch.io, and gaming news.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Indie Radar - Trending Games Scanner",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie Radar - Find Viral Indie Games",
    description: "Discover trending indie games before they go mainstream. Real-time scanning of Steam, itch.io, and gaming news.",
    images: ["/og-image.png"],
    creator: "@indieradar",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://indie-tracker.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#030306" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${orbitron.variable} ${jetbrains.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
