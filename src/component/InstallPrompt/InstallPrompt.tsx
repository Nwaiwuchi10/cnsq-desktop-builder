"use client";

/**
 * InstallPrompt — PWA Install Banner
 *
 * Handles two scenarios:
 * 1. Android / Chrome Desktop: Uses the `beforeinstallprompt` event to show
 *    a native "Add to Home Screen" install prompt.
 * 2. iOS Safari: Cannot trigger the native prompt programmatically.
 *    Instead shows a tooltip explaining how to install via Share → Add to Home Screen.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { isIOS, isStandalone } from "@/hooks/usePWA";

// -------------------------------------------------------
// Types
// -------------------------------------------------------
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// -------------------------------------------------------
// Component
// -------------------------------------------------------
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed or previously dismissed
    if (isStandalone()) return;
    if (sessionStorage.getItem("pwa-banner-dismissed")) return;

    // iOS Safari — show manual install instructions
    if (isIOS()) {
      setShowIOSBanner(true);
      return;
    }

    // Android / Chrome — listen for the native install prompt
    const handler = (e: Event) => {
      e.preventDefault(); // Prevent the mini-infobar from appearing
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroidBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log("[InstallPrompt] User choice:", outcome);
    setDeferredPrompt(null);
    setShowAndroidBanner(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowAndroidBanner(false);
    setShowIOSBanner(false);
    sessionStorage.setItem("pwa-banner-dismissed", "true");
  };

  if (dismissed) return null;

  // ---- Android / Desktop Install Banner ----
  if (showAndroidBanner) {
    return (
      <div style={styles.banner} role="banner" aria-label="Install CN-Squad app">
        <div style={styles.bannerLeft}>
          <Image
            src="/icons/icon-192x192.png"
            alt="CN-Squad logo"
            width={40}
            height={40}
            style={styles.bannerIcon}
          />
          <div>
            <p style={styles.bannerTitle}>Install CN-Squad</p>
            <p style={styles.bannerSubtitle}>Add to home screen for the best experience</p>
          </div>
        </div>
        <div style={styles.bannerActions}>
          <button
            onClick={handleInstall}
            style={styles.installBtn}
            aria-label="Install app"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            style={styles.dismissBtn}
            aria-label="Dismiss install prompt"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // ---- iOS Safari Install Instructions ----
  if (showIOSBanner) {
    return (
      <div style={styles.banner} role="banner" aria-label="Add CN-Squad to home screen">
        <div style={styles.bannerLeft}>
          <Image
            src="/icons/apple-touch-icon.png"
            alt="CN-Squad logo"
            width={40}
            height={40}
            style={styles.bannerIcon}
          />
          <div>
            <p style={styles.bannerTitle}>Install CN-Squad</p>
            <p style={styles.bannerSubtitle}>
              Tap{" "}
              <span style={styles.shareIcon} aria-label="Share button">
                ⎋
              </span>{" "}
              then &ldquo;Add to Home Screen&rdquo;
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          style={styles.dismissBtn}
          aria-label="Dismiss install prompt"
        >
          ✕
        </button>
      </div>
    );
  }

  return null;
}

// -------------------------------------------------------
// Inline Styles (avoids Tailwind dependency for this utility component)
// -------------------------------------------------------
const styles: Record<string, React.CSSProperties> = {
  banner: {
    position: "fixed",
    bottom: "1rem",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
    background: "rgba(15, 15, 15, 0.92)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(22, 163, 74, 0.4)",
    borderRadius: "1rem",
    padding: "0.75rem 1rem",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    maxWidth: "min(420px, calc(100vw - 2rem))",
    width: "100%",
    animation: "slideUp 0.3s ease-out",
  },
  bannerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flex: 1,
  },
  bannerIcon: {
    borderRadius: "10px",
    flexShrink: 0,
  },
  bannerTitle: {
    margin: 0,
    fontWeight: 600,
    fontSize: "0.875rem",
    color: "#ffffff",
    lineHeight: 1.3,
  },
  bannerSubtitle: {
    margin: 0,
    fontSize: "0.75rem",
    color: "#9ca3af",
    lineHeight: 1.4,
  },
  shareIcon: {
    fontStyle: "normal",
    color: "#3b82f6",
    fontWeight: 700,
  },
  bannerActions: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    flexShrink: 0,
  },
  installBtn: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    borderRadius: "0.5rem",
    padding: "0.4rem 0.9rem",
    fontSize: "0.8125rem",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  dismissBtn: {
    background: "transparent",
    color: "#6b7280",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "0.25rem 0.5rem",
    lineHeight: 1,
    borderRadius: "0.25rem",
  },
};
