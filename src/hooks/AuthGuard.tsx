"use client";

import LoadingSpinner from "@/component/Loading/LoadingSpinner";
import { useAuth } from "./AuthHook";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuth();

  if (isAuthenticated === null) {
    // still checking auth
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
        {/* lOading..... */}
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect already triggered
  }

  return <>{children}</>;
}
