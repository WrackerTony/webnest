"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import {
  Button,
  Input,
  Card,
  CardBody,
  ShaderBackground,
} from "../components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";

      // Provide more user-friendly error messages
      if (errorMessage === "Invalid email or password") {
        setError(
          "The email or password you entered is incorrect. Please check your credentials and try again."
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Shader background container */}
      <div className="absolute inset-0">
        <ShaderBackground />
      </div>

      <Card className="relative z-10 w-full max-w-md border-white/20 bg-black/30 backdrop-blur-xl">
        <CardBody className="p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/30">
              <svg
                className="w-7 h-7 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-white/70">Sign in to your WebNest account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign in
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-white/70">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-violet-300 hover:text-violet-200 transition-colors"
            >
              Create one
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
