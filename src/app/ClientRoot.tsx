"use client";

import React from "react";
import AppEvents from "./AppEvents";
import { usePWA } from "@/hooks/usePWA";
import dynamic from "next/dynamic";

// Dynamically import InstallPrompt so it's only loaded client-side (no SSR)
const InstallPrompt = dynamic(
  () => import("@/component/InstallPrompt/InstallPrompt"),
  { ssr: false }
);

export default function ClientRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  // Registers the service worker and sets up push notification subscription
  usePWA();

  return (
    <>
      <AppEvents />
      {children}
      {/* PWA install banner — handles both Android and iOS prompts */}
      <InstallPrompt />
    </>
  );
}
