"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Modal, Button, Input, Textarea } from "@/app/components/ui";
import { useAuth } from "@/app/contexts/AuthContext";

interface Website {
  _id: Id<"websites">;
  url: string;
  title: string;
  description?: string;
  tags?: string[];
  faviconUrl?: string;
  clickCount: number;
}

interface EditWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  website: Website | null;
  onSuccess?: () => void;
}

export default function EditWebsiteModal({
  isOpen,
  onClose,
  website,
  onSuccess,
}: EditWebsiteModalProps) {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const updateWebsite = useMutation(api.websites.update);

  useEffect(() => {
    if (website) {
      setTitle(website.title);
      setDescription(website.description || "");
      setTags(website.tags?.join(", ") || "");
    }
  }, [website]);

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!website || !token) return;

    setIsLoading(true);
    setError("");

    try {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await updateWebsite({
        token,
        websiteId: website._id,
        title: title || website.title,
        description: description || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update website");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Website">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {website?.faviconUrl ? (
            <img src={website.faviconUrl} alt="" className="w-8 h-8 rounded" />
          ) : (
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {website?.url}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {website?.clickCount || 0} clicks
            </p>
          </div>
        </div>

        <Input
          label="Title"
          placeholder="Website title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Optional description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <Input
          label="Tags"
          placeholder="design, tools, inspiration"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          helperText="Separate tags with commas"
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
