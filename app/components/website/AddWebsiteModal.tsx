"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Modal, Button, Input, Textarea } from "@/app/components/ui";
import { useAuth } from "@/app/contexts/AuthContext";

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: Id<"categories">;
  folderId?: Id<"folders"> | null;
  onSuccess?: () => void;
}

export default function AddWebsiteModal({
  isOpen,
  onClose,
  categoryId,
  folderId,
  onSuccess,
}: AddWebsiteModalProps) {
  const { user, token } = useAuth();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    Id<"categories"> | undefined
  >(categoryId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = useQuery(
    api.categories.list,
    user ? { token: token! } : "skip"
  );

  const createWebsite = useMutation(api.websites.create);

  const resetForm = () => {
    setUrl("");
    setTitle("");
    setDescription("");
    setTags("");
    setSelectedCategoryId(categoryId);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      setError("URL is required");
      return;
    }

    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const finalUrl = url.startsWith("http") ? url : `https:
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await createWebsite({
        token: token!,
        categoryId: selectedCategoryId,
        folderId: folderId ?? undefined,
        url: finalUrl,
        title: title || new URL(finalUrl).hostname,
        description: description || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });

      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add website");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    if (!url) return;

    try {
      const finalUrl = url.startsWith("http") ? url : `https://${url}`;
      new URL(finalUrl);

      // In a real app, you'd call an API to fetch metadata
      // For now, we'll just set the hostname as title
      const hostname = new URL(finalUrl).hostname;
      if (!title) {
        setTitle(hostname.replace("www.", ""));
      }
    } catch {
      // Invalid URL, ignore
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Website">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="URL"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={fetchMetadata}
          required
        />

        <Input
          label="Title"
          placeholder="Website title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          helperText="Leave empty to use the domain name"
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

        {/* Category selection */}
        <div>
          <label
            htmlFor="category-select"
            className="block text-sm font-medium text-gray-700 dark:text-[#CBC9CF] mb-1"
          >
            Category
          </label>
          <select
            id="category-select"
            value={selectedCategoryId || ""}
            onChange={(e) =>
              setSelectedCategoryId(
                e.target.value
                  ? (e.target.value as Id<"categories">)
                  : undefined
              )
            }
            className="w-full px-3 py-2 bg-white dark:bg-[#3C3B3D] border border-gray-200 dark:border-[#3C3B3D] rounded-lg text-gray-900 dark:text-[#CBC9CF] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          >
            <option value="">Uncategorized</option>
            {categories?.map((category: any) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Add Website
          </Button>
        </div>
      </form>
    </Modal>
  );
}
