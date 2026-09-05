import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { MotionProvider } from "@/components/shared/motion-provider";
import { SessionProvider } from "@/components/shared/session-provider";
import { Toaster } from "@/components/shared/Toaster";
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "AI Digital Twin Platform",
  description: "Your AI operates under approval — never without it.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    // iOS ignores the web manifest entirely for Add to Home Screen — this
    // is the only way Safari picks up a title and standalone display mode.
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Twin",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/*
          Safety net for the `invisible-until-js` utility (globals.css) used
          by HeroSection's GSAP entrance animation: that class hides content
          via CSS from the very first paint so JS can smoothly reveal it,
          but if JavaScript never runs at all (disabled, blocked, failed to
          load), nothing would ever clear that hidden state — the entire
          hero would stay permanently blank for that visitor, which is a
          strictly worse outcome than the flash the class exists to fix.
          <noscript> only ever renders when JS is genuinely unavailable.
        */}
        <noscript>
          <style>{".invisible-until-js { visibility: visible !important; }"}</style>
        </noscript>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          themes={["dark", "light"]}
          disableTransitionOnChange
        >
          <MotionProvider>
            <SessionProvider>{children}</SessionProvider>
          </MotionProvider>
          <Toaster />
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  );
}
