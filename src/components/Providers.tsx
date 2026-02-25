"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import ToastViewport from "@/components/ui/ToastViewport";
import { useThemePreference } from "@/hooks/useThemePreference";

function ThemeInitializer() {
  useThemePreference();
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  // We use a fallback here just in case the env variable isn't loaded yet
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ThemeInitializer />
      {children}
      <ToastViewport />
    </GoogleOAuthProvider>
  );
}
