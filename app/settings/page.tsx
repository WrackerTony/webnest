"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useCursor } from "../contexts";
import {
  Button,
  Input,
  Select,
  Card,
  CardBody,
  Tabs,
  TabPanel,
} from "../components/ui";

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    isLoading: authLoading,
    updateProfile,
    updatePreferences,
    changePassword,
  } = useAuth();
  const { cursorStyle, setCursorStyle } = useCursor();

  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [name, setName] = useState("");

  const [defaultView, setDefaultView] = useState<"grid" | "list">("grid");
  const [defaultSort, setDefaultSort] = useState<
    "dateAdded" | "clickCount" | "rating" | "title"
  >("dateAdded");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      if (user.preferences) {
        setDefaultView(user.preferences.defaultView);
        setDefaultSort(user.preferences.defaultSort);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile({ name });
      showMessage("success", "Profile updated successfully");
    } catch (error: unknown) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updatePreferences({
        defaultView,
        defaultSort,
      });
      showMessage("success", "Preferences updated successfully");
    } catch (error: unknown) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "Failed to update preferences"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showMessage("error", "Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showMessage("success", "Password changed successfully");
    } catch (error: unknown) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "Failed to change password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "preferences", label: "Preferences" },
    { id: "security", label: "Security" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-linear-to-br from-background via-background to-surface dark:from-[#1E1E1F] dark:via-[#1E1E1F] dark:to-[#2a2a2b] min-h-screen">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-[#CBC9CF]">
          Settings
        </h1>
        <p className="mt-1 text-gray-500 dark:text-[#6D6C70]">
          Manage your account settings and preferences
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-red-100 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Profile Tab */}
      <TabPanel tabId="profile" activeTab={activeTab}>
        <Card>
          <CardBody>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold shadow-lg shadow-violet-500/30">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-[#CBC9CF]">
                    {user.name}
                  </h3>
                  <p className="text-gray-500 dark:text-[#6D6C70]">
                    {user.email}
                  </p>
                </div>
              </div>

              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />

              <Input
                label="Email"
                value={user.email}
                disabled
                helperText="Email cannot be changed"
              />

              <div className="flex justify-end">
                <Button type="submit" isLoading={isLoading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </TabPanel>

      {/* Preferences Tab */}
      <TabPanel tabId="preferences" activeTab={activeTab}>
        <Card>
          <CardBody>
            <form onSubmit={handleUpdatePreferences} className="space-y-6">
              <Select
                label="Default View"
                value={defaultView}
                onChange={(e) =>
                  setDefaultView(e.target.value as "grid" | "list")
                }
                options={[
                  { value: "grid", label: "Grid View" },
                  { value: "list", label: "List View" },
                ]}
              />

              <Select
                label="Default Sorting"
                value={defaultSort}
                onChange={(e) =>
                  setDefaultSort(e.target.value as typeof defaultSort)
                }
                options={[
                  { value: "dateAdded", label: "Date Added" },
                  { value: "clickCount", label: "Click Count" },
                  { value: "rating", label: "Rating" },
                  { value: "title", label: "Title" },
                ]}
              />

              <Select
                label="Cursor Style"
                value={cursorStyle}
                onChange={(e) =>
                  setCursorStyle(
                    e.target.value as "default" | "pointer" | "cursor"
                  )
                }
                options={[
                  { value: "default", label: "System Default" },
                  { value: "pointer", label: "Custom Pointer (Purple)" },
                  { value: "cursor", label: "Custom Cursor (Arrow)" },
                ]}
              />

              <div className="flex justify-end">
                <Button type="submit" isLoading={isLoading}>
                  Save Preferences
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel tabId="security" activeTab={activeTab}>
        <Card>
          <CardBody>
            <h3 className="text-lg font-medium text-gray-900 dark:text-[#CBC9CF] mb-6">
              Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-6">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />

              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                helperText="At least 6 characters"
                autoComplete="new-password"
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />

              <div className="flex justify-end">
                <Button type="submit" isLoading={isLoading}>
                  Change Password
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </TabPanel>
    </div>
  );
}
