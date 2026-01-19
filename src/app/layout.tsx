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
  title: "INDIE RADAR // Trending Games Scanner",
  description: "Classified intel on viral indie games. Find them before they blow up.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${jetbrains.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
