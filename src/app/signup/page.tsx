"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Chrome } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import api from "@/lib/api";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@/components/ui";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await api.post("/auth/signup/", {
        full_name: fullName,
        email,
        password,
      });
      router.push("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "An unexpected error occurred. Is your backend running?",
      );
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await api.post("/auth/google/", {
          token: tokenResponse.access_token,
        });

        localStorage.setItem("access_token", response.data.access_token);
        router.push("/dashboard");
      } catch (err: any) {
        setError("Google signup failed on the server.");
      }
    },
    onError: () => setError("Google signup failed."),
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>
            Start managing procurement and carbon impact in one place.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <form onSubmit={handleStandardSubmit} className="space-y-4">
            <Input
              id="fullName"
              type="text"
              label="Full Name"
              placeholder="Alex Johnson"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
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
              placeholder="Enter a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error || undefined}
              required
            />

            <Button type="submit" className="w-full">
              Sign Up
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
            Already have an account?{" "}
            <Link href="/login" className="rounded-sm font-medium text-scope-primary hover:text-scope-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scope-primary">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
