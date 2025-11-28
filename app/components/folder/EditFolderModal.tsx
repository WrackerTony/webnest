"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Modal, Button, Input } from "@/app/components/ui";
import { useAuth } from "@/app/contexts/AuthContext";

interface Folder {
  _id: Id<"folders">;
  name: string;
  parentId?: Id<"folders">;
  isPublic: boolean;
}

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: Folder | null;
  onSuccess?: () => void;
}

export default function EditFolderModal({
  isOpen,
  onClose,
  folder,
  onSuccess,
}: EditFolderModalProps) {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const updateFolder = useMutation(api.folders.update);

  useEffect(() => {
    if (folder) {
      setName(folder.name);
      setIsPublic(folder.isPublic);
    }
  }, [folder]);

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folder || !token) return;

    if (!name.trim()) {
      setError("Folder name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await updateFolder({
        token,
        folderId: folder._id,
        name: name.trim(),
        isPublic,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update folder");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Folder">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Folder Name"
          placeholder="My Folder"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="sr-only peer"
              aria-label="Make folder public"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Make folder public
          </span>
        </div>

        {isPublic && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm">
            Public folders can be viewed by anyone with the link
          </div>
        )}

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
