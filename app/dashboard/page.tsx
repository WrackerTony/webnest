"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardBody,
  Button,
  LoadingScreen,
  EmptyState,
} from "../components/ui";

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();

  const analytics = useQuery(
    api.analytics.getOverview,
    token ? { token } : "skip"
  );

  const mostClicked = useQuery(
    api.analytics.getMostClicked,
    token ? { token, limit: 5 } : "skip"
  );

  const highestRated = useQuery(
    api.analytics.getHighestRated,
    token ? { token, limit: 5 } : "skip"
  );

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#CBC9CF]">
            Welcome back, <span className="gradient-text">{user.name}</span>!
          </h1>
          <p className="mt-2 text-gray-500 dark:text-[#6D6C70]">
            Here&apos;s an overview of your saved websites
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link href="/library">
            <Button>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add website
            </Button>
          </Link>
          <Link href="/library">
            <Button variant="outline">Browse library</Button>
          </Link>
        </div>

        {/* Stats cards */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Websites"
              value={analytics.totalWebsites}
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
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              }
            />
            <StatCard
              title="Total Folders"
              value={analytics.totalFolders}
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
            />
            <StatCard
              title="Total Clicks"
              value={analytics.totalClicks}
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
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              }
            />
            <StatCard
              title="Average Rating"
              value={analytics.averageRating}
              suffix="/5"
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
            />
          </div>
        )}

        {/* Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most clicked */}
          <Card>
            <CardBody>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#CBC9CF] mb-4">
                Most Clicked Websites
              </h2>
              {mostClicked && mostClicked.length > 0 ? (
                <div className="space-y-2">
                  {mostClicked.map((website: any) => (
                    <WebsiteRow key={website._id} website={website} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No websites yet"
                  description="Start adding websites to see your most visited ones"
                />
              )}
            </CardBody>
          </Card>

          {/* Highest rated */}
          <Card>
            <CardBody>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#CBC9CF] mb-4">
                Highest Rated Websites
              </h2>
              {highestRated && highestRated.length > 0 ? (
                <div className="space-y-2">
                  {highestRated.map((website: any) => (
                    <WebsiteRow
                      key={website._id}
                      website={website}
                      showRating
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No ratings yet"
                  description="Rate your saved websites to see your favorites"
                />
              )}
            </CardBody>
          </Card>
        </div>

        {/* Top tags */}
        {analytics && analytics.topTags.length > 0 && (
          <Card className="mt-6">
            <CardBody>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-[#CBC9CF] mb-4">
                Popular Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {analytics.topTags.map(
                  (tag: { tag: string; count: number }) => (
                    <span
                      key={tag.tag}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-100 dark:bg-violet-500/10 border border-violet-300 dark:border-violet-500/20 text-violet-600 dark:text-violet-400 rounded-xl text-sm"
                    >
                      {tag.tag}
                      <span className="text-xs bg-violet-200 dark:bg-violet-500/20 px-1.5 py-0.5 rounded-lg">
                        {tag.count}
                      </span>
                    </span>
                  )
                )}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  suffix,
  icon,
}: {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="card-hover">
      <CardBody>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-violet-100 dark:bg-violet-500/10 border border-violet-300 dark:border-violet-500/20 text-violet-600 dark:text-violet-400 rounded-xl">
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-[#6D6C70]">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-[#CBC9CF]">
              {value}
              {suffix && (
                <span className="text-lg font-normal text-gray-500 dark:text-[#6D6C70]">
                  {suffix}
                </span>
              )}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function WebsiteRow({
  website,
  showRating,
}: {
  website: any;
  showRating?: boolean;
}) {
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  return (
    <a
      href={website.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#3C3B3D]/50 transition-all duration-300"
    >
      <img
        src={website.faviconUrl || getFaviconUrl(website.url) || "/favicon.ico"}
        alt=""
        className="w-8 h-8 rounded-lg"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/favicon.ico";
        }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-[#CBC9CF] truncate">
          {website.title}
        </p>
        <p className="text-sm text-gray-500 dark:text-[#6D6C70] truncate">
          {new URL(website.url).hostname}
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#6D6C70]">
        {showRating ? (
          <div className="flex items-center gap-1 text-amber-400">
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            {website.rating}
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {website.clickCount}
          </div>
        )}
      </div>
    </a>
  );
}
