"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chrome } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { isAxiosError } from "axios";
import api, { setAuthToken } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { Token } from "@/types/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui";

type ApiErrorResponse = {
  detail?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detail || fallback;
  }

  return fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await api.post<Token>("/auth/google/", {
          token: tokenResponse.access_token,
        });

        setAuthToken(response.data.access_token);
        setAuth({
          isAuthenticated: true,
        });
        router.push("/dashboard");
      } catch {
        setError("Google signup failed on the server.");
      }
    },
    onError: () => setError("Google signup failed."),
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post<Token>("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      setAuthToken(response.data.access_token);
      setAuth({
        isAuthenticated: true,
      });
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Invalid credentials."));
      setAuth({
        user: null,
        isAuthenticated: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log in to Carbon Engine</CardTitle>
          <CardDescription>
            Access supplier, spend, and emissions workflows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error || undefined}
              required
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-scope-border" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-scope-textMuted">
              Or
            </span>
            <div className="h-px flex-1 bg-scope-border" />
          </div>

          <Button
            onClick={() => loginWithGoogle()}
            variant="outline"
            className="w-full gap-2"
          >
            <Chrome className="h-4 w-4" />
            Continue with Google
          </Button>

          <p className="text-center text-sm text-slate-500 dark:text-scope-textMuted">
            No account yet?{" "}
            <Link
              href="/signup"
              className="rounded-sm font-medium text-scope-primary hover:text-scope-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
