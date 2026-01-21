import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "@/components/Providers";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Proven.so | Prediction Markets",
  description: "Get rewarded for being right — and have it proven.",
  icons: {
    // Prefer Next's native app/icon.png. (Do not reference /favicon.png: it's not a public URL.)
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.variable,
        outfit.variable
      )}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
