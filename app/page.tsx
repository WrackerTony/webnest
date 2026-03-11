"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./contexts/AuthContext";
import { Button, ShaderBackground } from "./components/ui";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [isLoading, user, router]);

  return (
    <div className="min-h-screen transition-colors duration-300">

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        <div className="absolute inset-0">
          <ShaderBackground />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 mb-8 animate-in fade-in slide-up">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-sm text-white font-medium">
                Your personal web organizer
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight animate-in fade-in slide-up delay-100">
              <span className="text-white drop-shadow-lg">Organize Your</span>
              <br />
              <span className="bg-linear-to-r from-violet-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-lg">
                Digital World
              </span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-up delay-200 drop-shadow-md">
              Save, organize, and rate your favorite websites in a beautiful,
              hierarchical folder system. Never lose track of an important link
              again.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-up delay-300">
              <Link href="/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 border-0 text-white glow-hover transition-all duration-300"
                >
                  Get Started Free
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-border dark:border-[#6D6C70]/50 text-foreground dark:text-[#CBC9CF] hover:bg-surface dark:hover:bg-[#3C3B3D] hover:border-violet-500/50 transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="mt-20 grid grid-cols-2 gap-8 max-w-md mx-auto animate-in fade-in slide-up delay-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-300">∞</div>
                <div className="text-sm text-white/70 mt-1">Folders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-300">Free</div>
                <div className="text-sm text-white/70 mt-1">Forever</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
          <svg
            className="w-6 h-6 text-white/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      <section className="relative py-32 bg-background dark:bg-[#1E1E1F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground dark:text-[#CBC9CF] mb-6">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p className="text-lg text-muted dark:text-[#6D6C70] max-w-2xl mx-auto">
              Everything you need to organize and discover your favorite
              websites
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              }
              title="Hierarchical Folders"
              description="Create unlimited folders and subfolders to organize your websites exactly how you want."
              delay="delay-100"
            />
            <FeatureCard
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
              title="Smart Search"
              description="Find any website instantly with powerful search and tag-based filtering."
              delay="delay-200"
            />
            <FeatureCard
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              }
              title="Ratings & Reviews"
              description="Rate your saved websites to remember which ones are most useful."
              delay="delay-300"
            />
            <FeatureCard
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
              title="Analytics Dashboard"
              description="Track clicks, ratings, and usage trends with beautiful visualizations."
              delay="delay-100"
            />
            <FeatureCard
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              }
              title="Public Libraries"
              description="Share your curated collections with others by making folders public."
              delay="delay-200"
            />
            <FeatureCard
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              }
              title="Dark Mode"
              description="Beautiful dark interface that's easy on your eyes, day and night."
              delay="delay-300"
            />
          </div>
        </div>
      </section>

      <footer className="bg-surface/50 dark:bg-[#1E1E1F] border-t border-border dark:border-[#3C3B3D] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
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
              <span className="text-xl font-bold text-foreground dark:text-[#CBC9CF]">
                WebNest
              </span>
            </div>
            <p className="text-muted dark:text-[#6D6C70] text-sm">
              © {new Date().getFullYear()} WebNest. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay = "",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
}) {
  return (
    <div
      className={`group p-6 bg-surface/50 dark:bg-[#3C3B3D]/30 border border-border/30 dark:border-[#6D6C70]/20 rounded-2xl card-hover hover:border-violet-500/30 animate-in fade-in slide-up backdrop-blur-sm ${delay}`}
    >
      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/20 flex items-center justify-center mb-5 group-hover:border-violet-500/40 transition-colors">
        <div className="text-violet-600 dark:text-violet-400 group-hover:text-violet-500 dark:group-hover:text-violet-300 transition-colors">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-foreground dark:text-[#CBC9CF] mb-2 group-hover:text-violet-600 dark:group-hover:text-white transition-colors">
        {title}
      </h3>
      <p className="text-muted dark:text-[#6D6C70] text-sm leading-relaxed group-hover:text-foreground/70 dark:group-hover:text-[#CBC9CF]/70 transition-colors">
        {description}
      </p>
    </div>
  );
}
