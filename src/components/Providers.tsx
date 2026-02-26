"use client";

import { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Cookies from "js-cookie";
import ToastViewport from "@/components/ui/ToastViewport";
import { useThemePreference } from "@/hooks/useThemePreference";
import { useToast } from "@/hooks/useToast";
import { registerApiErrorHandlers } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

function ThemeInitializer() {
  useThemePreference();
  return null;
}

function ApiErrorToastBridge() {
  const toast = useToast();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    registerApiErrorHandlers({
      onUnauthorized: () => {
        clearAuth();
        toast.info("Session expired", "Please log in again.");
      },
      onValidationError: (messages) => {
        messages.forEach((message) => {
          toast.error("Validation error", message);
        });
      },
    });

    return () => {
      registerApiErrorHandlers({});
    };
  }, [clearAuth, toast]);

  return null;
}

function AuthInitializer() {
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = Cookies.get("access_token") ?? window.localStorage.getItem("access_token");
    if (token) {
      setAuth({
        isAuthenticated: true,
      });
    }
  }, [setAuth]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // We use a fallback here just in case the env variable isn't loaded yet
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ThemeInitializer />
      <AuthInitializer />
      <ApiErrorToastBridge />
      {children}
      <ToastViewport />
    </GoogleOAuthProvider>
  );
}
