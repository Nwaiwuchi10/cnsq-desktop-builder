import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProtectedLayout from "@/hooks/AuthGuard";
import ClientRoot from "./ClientRoot";
import { ThemeProvider } from "@/hooks/ThemeContext";
// import ScrollToTop from "@/component/ScrollToTop/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CN-Squad",
  description: "Staff Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
