"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  //   const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("user-token");
    // setToken(t);

    // allow login and register pages without redirect
    if (
      pathname === "/login"
      // || pathname === "/register"
    ) {
      setIsAuthenticated(true);
      return;
    }

    if (!token) {
      setIsAuthenticated(false);
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router, pathname]);

  return isAuthenticated;
}
