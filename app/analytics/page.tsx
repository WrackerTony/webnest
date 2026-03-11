"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardBody, LoadingScreen, EmptyState } from "../components/ui";

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();

  const analytics = useQuery(
    api.analytics.getOverview,
    user ? { token: token! } : "skip",
  );

  const mostClicked = useQuery(
    api.analytics.getMostClicked,
    user ? { token: token!, limit: 10 } : "skip",
  );

  const highestRated = useQuery(
    api.analytics.getHighestRated,
    user ? { token: token!, limit: 10 } : "skip",
  );

  const usageTrends = useQuery(
    api.analytics.getUsageTrends,
    user ? { token: token!, days: 30 } : "skip",
  );

  const folderStats = useQuery(
    api.analytics.getFolderStats,
    user ? { token: token! } : "skip",
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return <LoadingScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-linear-to-br from-background via-background to-surface dark:from-[#1E1E1F] dark:via-[#1E1E1F] dark:to-[#2a2a2b] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-[#CBC9CF]">
          Analytics
        </h1>
        <p className="mt-1 text-gray-500 dark:text-[#6D6C70]">
          Track your website usage and discover trends
        </p>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard title="Total Websites" value={analytics.totalWebsites} />
          <StatCard title="Total Folders" value={analytics.totalFolders} />
          <StatCard title="Total Clicks" value={analytics.totalClicks} />
          <StatCard
            title="Average Rating"
            value={analytics.averageRating}
            suffix="/5"
          />
          <StatCard title="Added This Month" value={analytics.recentlyAdded} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-[#CBC9CF] mb-4">
              Most Clicked Websites
            </h2>
            {mostClicked && mostClicked.length > 0 ? (
              <div className="space-y-2">
                {mostClicked.map((website: any, index: number) => (
                  <div
                    key={website._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3C3B3D]/50 transition-colors"
                  >
                    <span className="w-6 h-6 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-[#6D6C70]">
                      {index + 1}
                    </span>
                    <img
                      src={getFaviconUrl(website.url)}
                      alt=""
                      className="w-6 h-6 rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-[#CBC9CF] truncate">
                        {website.title}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-violet-400">
                      {website.clickCount} clicks
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No clicks yet"
                description="Start using your saved websites to see click statistics"
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-[#CBC9CF] mb-4">
              Highest Rated Websites
            </h2>
            {highestRated && highestRated.length > 0 ? (
              <div className="space-y-2">
                {highestRated.map((website: any, index: number) => (
                  <div
                    key={website._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3C3B3D]/50 transition-colors"
                  >
                    <span className="w-6 h-6 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-[#6D6C70]">
                      {index + 1}
                    </span>
                    <img
                      src={getFaviconUrl(website.url)}
                      alt=""
                      className="w-6 h-6 rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-[#CBC9CF] truncate">
                        {website.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < website.rating
                              ? "text-violet-500 dark:text-violet-400 fill-violet-500 dark:fill-violet-400"
                              : "text-gray-300 dark:text-[#3C3B3D]"
                          }`}
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
                      ))}
                    </div>
                  </div>
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

      {/* Usage trends chart */}
      <Card className="mb-6">
        <CardBody>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-[#CBC9CF] mb-4">
            Websites Added (Last 30 Days)
          </h2>
          {usageTrends && usageTrends.length > 0 ? (
            <div className="h-48 flex items-end gap-1">
              {usageTrends.map((day: { date: string; count: number }) => {
                const maxCount = Math.max(
                  ...usageTrends.map((d: any) => d.count),
                  1,
                );
                const height = (day.count / maxCount) * 100;
                return (
                  <div
                    key={day.date}
                    className="flex-1 group relative"
                    title={`${day.date}: ${day.count} websites`}
                  >
                    <div
                      className="bg-linear-to-t from-violet-600 to-purple-500 rounded-t transition-all hover:from-violet-500 hover:to-purple-400 shadow-lg shadow-violet-500/20"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-white dark:bg-[#1E1E1F] text-gray-900 dark:text-[#CBC9CF] text-xs px-2 py-1 rounded border border-gray-200 dark:border-[#3C3B3D] whitespace-nowrap shadow-lg">
                      {day.date}: {day.count}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No data yet"
              description="Start adding websites to see your usage trends"
            />
          )}
        </CardBody>
      </Card>

      {/* Folder statistics */}
      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-[#CBC9CF] mb-4">
            Folder Statistics
          </h2>
          {folderStats && folderStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#3C3B3D]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-[#6D6C70]">
                      Folder
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-[#6D6C70]">
                      Visibility
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-[#6D6C70]">
                      Websites
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {folderStats.map((folder: any) => (
                    <tr
                      key={folder.id}
                      className="border-b border-gray-100 dark:border-[#3C3B3D]/50 hover:bg-gray-50 dark:hover:bg-[#3C3B3D]/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-gray-400 dark:text-[#6D6C70]"
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
                          <span className="font-medium text-gray-900 dark:text-[#CBC9CF]">
                            {folder.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                            folder.isPublic
                              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30"
                              : "bg-gray-100 dark:bg-[#3C3B3D] text-gray-700 dark:text-[#CBC9CF] border-gray-300 dark:border-[#6D6C70]/30"
                          }`}
                        >
                          {folder.isPublic ? "Public" : "Private"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-[#CBC9CF]">
                        {folder.websiteCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No folders yet"
              description="Create folders to organize your websites"
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  suffix,
}: {
  title: string;
  value: number;
  suffix?: string;
}) {
  // Format value: for ratings show one decimal, for others show integer
  const displayValue =
    suffix === "/5"
      ? typeof value === "number"
        ? value.toFixed(1)
        : "0.0"
      : value;

  return (
    <Card>
      <CardBody className="text-center">
        <p className="text-sm text-gray-500 dark:text-[#6D6C70]">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-[#CBC9CF]">
          {displayValue}
          {suffix}
        </p>
      </CardBody>
    </Card>
  );
}

function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return "/favicon.ico";
  }
}
