import type { Metadata, Viewport } from "next";
import "./globals.css";
import ProtectedLayout from "@/hooks/AuthGuard";
import ClientRoot from "./ClientRoot";
import { ThemeProvider } from "@/hooks/ThemeContext";
// import ScrollToTop from "@/component/ScrollToTop/ScrollToTop";

export const metadata: Metadata = {
  title: "CN-Squad",
  description: "Staff Management System for ConnectNigeria",
  // PWA manifest reference
  manifest: "/manifest.json",
  // iOS Safari home-screen meta tags
  appleWebApp: {
    capable: true,
    title: "CN-Squad",
    statusBarStyle: "black-translucent",
  },
  // Open Graph for link previews
  openGraph: {
    title: "CN-Squad",
    description: "Staff Management System for ConnectNigeria",
    type: "website",
  },
};

// Separate viewport export (Next.js 14+ requirement for themeColor)
export const viewport: Viewport = {
  themeColor: "#16a34a",
  // viewport-fit=cover ensures content reaches iPhone notch / Dynamic Island
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ── PWA Icons ─────────────────────────────────────── */}
        {/* Apple touch icon: shown on iOS when added to Home Screen */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        {/* Standard favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
      </head>
      <body
        className="font-sans antialiased"
      >
        {/* <ScrollToTop /> */}
        <ThemeProvider>
          <ProtectedLayout>
            <ClientRoot>{children}</ClientRoot>
          </ProtectedLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
