"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../contexts/AuthContext";
import {
  WebsiteCard,
  AddWebsiteModal,
  EditWebsiteModal,
} from "../components/website";
import {
  CategoryList,
  CATEGORY_COLORS,
  CATEGORY_ICON_OPTIONS,
} from "../components/category";
import {
  Button,
  Input,
  LoadingScreen,
  EmptyState,
  Modal,
  ConfirmModal,
} from "../components/ui";
import { Id } from "../../convex/_generated/dataModel";

// Category type
interface Category {
  _id: Id<"categories">;
  name: string;
  color: string;
  icon: string;
  order: number;
  websiteCount?: number;
}

// Website type
interface Website {
  _id: Id<"websites">;
  url: string;
  title: string;
  description?: string;
  faviconUrl?: string;
  tags: string[];
  clickCount: number;
  rating?: number;
  usefulness?: number;
  createdAt: number;
  categoryId?: Id<"categories">;
}

export default function LibraryPage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();

  // View state
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "dateAdded" | "clickCount" | "rating" | "title"
  >("dateAdded");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    Id<"categories"> | undefined
  >();

  // Modal state
  const [isAddWebsiteOpen, setIsAddWebsiteOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [deletingWebsite, setDeletingWebsite] = useState<Website | null>(null);
  const [movingWebsite, setMovingWebsite] = useState<Website | null>(null);

  // Category form state
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState(CATEGORY_COLORS[0]);
  const [categoryIcon, setCategoryIcon] = useState("folder");

  // Derived auth state
  const isAuthenticated = !!token && !authLoading;

  // Fetch data
  const categories = useQuery(
    api.categories.list,
    user ? { token: token! } : "skip"
  ) as Category[] | undefined;

  const websites = useQuery(
    api.websites.getByCategory,
    user ? { token: token!, categoryId: selectedCategoryId, sortBy } : "skip"
  ) as Website[] | undefined;

  const searchResults = useQuery(
    api.websites.search,
    user && searchQuery.length > 0
      ? { token: token!, query: searchQuery }
      : "skip"
  ) as Website[] | undefined;

  // Mutations
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const removeCategory = useMutation(api.categories.remove);
  const deleteWebsite = useMutation(api.websites.remove);
  const setWebsiteCategory = useMutation(api.websites.setCategory);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Display websites (search results or category websites)
  const displayedWebsites = useMemo(() => {
    if (searchQuery.length > 0 && searchResults) {
      return searchResults;
    }
    return websites || [];
  }, [searchQuery, searchResults, websites]);

  // Handle category form submit
  const handleCategorySubmit = async () => {
    if (!token || !categoryName.trim()) return;

    try {
      if (editingCategory) {
        await updateCategory({
          token,
          categoryId: editingCategory._id,
          name: categoryName,
          color: categoryColor,
          icon: categoryIcon,
        });
      } else {
        await createCategory({
          token,
          name: categoryName,
          color: categoryColor,
          icon: categoryIcon,
        });
      }
      closeCategoryModal();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  // Handle category delete
  const handleDeleteCategory = async () => {
    if (!token || !deletingCategory) return;

    try {
      await removeCategory({ token, categoryId: deletingCategory._id });
      setDeletingCategory(null);
      if (selectedCategoryId === deletingCategory._id) {
        setSelectedCategoryId(undefined);
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  // Handle website delete
  const handleDeleteWebsite = async () => {
    if (!token || !deletingWebsite) return;

    try {
      await deleteWebsite({ token, websiteId: deletingWebsite._id });
      setDeletingWebsite(null);
    } catch (error) {
      console.error("Failed to delete website:", error);
    }
  };

  // Handle move website to category
  const handleMoveWebsite = async (categoryId?: Id<"categories">) => {
    if (!token || !movingWebsite) return;

    try {
      await setWebsiteCategory({
        token,
        websiteId: movingWebsite._id,
        categoryId,
      });
      setMovingWebsite(null);
    } catch (error) {
      console.error("Failed to move website:", error);
    }
  };

  // Open category modal for editing
  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryColor(category.color);
    setCategoryIcon(category.icon);
    setIsCategoryModalOpen(true);
  };

  // Open category modal for creating
  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryColor(CATEGORY_COLORS[0]);
    setCategoryIcon("folder");
    setIsCategoryModalOpen(true);
  };

  // Close category modal
  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryColor(CATEGORY_COLORS[0]);
    setCategoryIcon("folder");
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1E1E1F]">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar with categories */}
        <aside className="w-64 border-r border-[#3C3B3D] bg-[#2C2B2D] overflow-y-auto hidden md:block">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-[#6D6C70] uppercase tracking-wider mb-2">
              Categories
            </h2>
            <CategoryList
              categories={categories || []}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
              onCreateCategory={openCreateCategory}
              onEditCategory={openEditCategory}
              onDeleteCategory={(cat) => setDeletingCategory(cat)}
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#1E1E1F] border-b border-[#3C3B3D] px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6D6C70]"
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
                  <input
                    type="text"
                    placeholder="Search all websites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#3C3B3D] border border-[#3C3B3D] rounded-lg text-[#CBC9CF] placeholder-[#6D6C70] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6D6C70] hover:text-[#CBC9CF]"
                      aria-label="Clear search"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-2 bg-[#3C3B3D] rounded-lg p-1">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    view === "grid"
                      ? "bg-violet-500 text-white"
                      : "text-[#6D6C70] hover:text-[#CBC9CF]"
                  }`}
                  aria-label="Grid view"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 rounded-md transition-colors ${
                    view === "list"
                      ? "bg-violet-500 text-white"
                      : "text-[#6D6C70] hover:text-[#CBC9CF]"
                  }`}
                  aria-label="List view"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>

              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#3C3B3D] border border-[#3C3B3D] text-[#CBC9CF] rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
                aria-label="Sort websites by"
              >
                <option value="dateAdded">Date Added</option>
                <option value="clickCount">Most Visited</option>
                <option value="rating">Highest Rated</option>
                <option value="title">Alphabetical</option>
              </select>

              {/* Add website button */}
              <Button onClick={() => setIsAddWebsiteOpen(true)}>
                <svg
                  className="w-4 h-4 mr-2"
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
                Add Website
              </Button>
            </div>

            {/* Current category indicator */}
            {searchQuery ? (
              <div className="mt-3 text-sm text-[#6D6C70]">
                Searching across all websites for &quot;{searchQuery}&quot;
              </div>
            ) : selectedCategoryId && categories ? (
              <div className="mt-3 flex items-center gap-2">
                {(() => {
                  const cat = categories.find(
                    (c) => c._id === selectedCategoryId
                  );
                  return cat ? (
                    <>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-sm font-medium text-[#CBC9CF]">
                        {cat.name}
                      </span>
                      <span className="text-sm text-[#6D6C70]">
                        ({displayedWebsites.length} website
                        {displayedWebsites.length !== 1 ? "s" : ""})
                      </span>
                    </>
                  ) : null;
                })()}
              </div>
            ) : (
              <div className="mt-3 text-sm text-[#6D6C70]">
                All Websites ({displayedWebsites.length})
              </div>
            )}
          </div>

          {/* Website grid/list */}
          <div className="p-6">
            {!websites ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
              </div>
            ) : displayedWebsites.length === 0 ? (
              <EmptyState
                icon={
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                }
                title={searchQuery ? "No results found" : "No websites yet"}
                description={
                  searchQuery
                    ? `No websites match "${searchQuery}"`
                    : selectedCategoryId
                      ? "Add your first website to this category"
                      : "Start by adding your favorite websites"
                }
                action={
                  !searchQuery ? (
                    <Button onClick={() => setIsAddWebsiteOpen(true)}>
                      <svg
                        className="w-4 h-4 mr-2"
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
                      Add Website
                    </Button>
                  ) : undefined
                }
              />
            ) : view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedWebsites.map((website) => (
                  <WebsiteCard
                    key={website._id}
                    website={website}
                    view="grid"
                    onEdit={(w) => setEditingWebsite(w as Website)}
                    onMove={(w) => setMovingWebsite(w as Website)}
                    onDelete={(w) => setDeletingWebsite(w as Website)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {displayedWebsites.map((website) => (
                  <WebsiteCard
                    key={website._id}
                    website={website}
                    view="list"
                    onEdit={(w) => setEditingWebsite(w as Website)}
                    onMove={(w) => setMovingWebsite(w as Website)}
                    onDelete={(w) => setDeletingWebsite(w as Website)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Website Modal */}
      <AddWebsiteModal
        isOpen={isAddWebsiteOpen}
        onClose={() => setIsAddWebsiteOpen(false)}
        categoryId={selectedCategoryId}
      />

      {/* Edit Website Modal */}
      {editingWebsite && (
        <EditWebsiteModal
          isOpen={true}
          onClose={() => setEditingWebsite(null)}
          website={editingWebsite}
        />
      )}

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        title={editingCategory ? "Edit Category" : "New Category"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#CBC9CF] mb-1">
              Name
            </label>
            <Input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., AI Tools"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#CBC9CF] mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICON_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCategoryIcon(option.value)}
                  className={`p-2 rounded-lg border transition-colors ${
                    categoryIcon === option.value
                      ? "border-violet-500 bg-violet-500/20"
                      : "border-[#3C3B3D] hover:border-[#6D6C70]"
                  }`}
                  title={option.label}
                >
                  <svg
                    className="w-5 h-5"
                    style={{ color: categoryColor }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {option.value === "folder" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    )}
                    {option.value === "ai" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    )}
                    {option.value === "tools" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                    )}
                    {option.value === "social" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    )}
                    {option.value === "dev" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    )}
                    {option.value === "news" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    )}
                    {option.value === "shopping" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    )}
                    {option.value === "entertainment" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                    )}
                    {option.value === "education" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    )}
                    {option.value === "star" && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    )}
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#CBC9CF] mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setCategoryColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    categoryColor === color
                      ? "border-white scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={closeCategoryModal}>
              Cancel
            </Button>
            <Button
              onClick={handleCategorySubmit}
              disabled={!categoryName.trim()}
            >
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Category Confirmation */}
      <ConfirmModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? Websites in this category will be moved to "Uncategorized".`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Delete Website Confirmation */}
      <ConfirmModal
        isOpen={!!deletingWebsite}
        onClose={() => setDeletingWebsite(null)}
        onConfirm={handleDeleteWebsite}
        title="Delete Website"
        message={`Are you sure you want to delete "${deletingWebsite?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Move Website Modal */}
      <Modal
        isOpen={!!movingWebsite}
        onClose={() => setMovingWebsite(null)}
        title="Move to Category"
      >
        <div className="space-y-2">
          <button
            onClick={() => handleMoveWebsite(undefined)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
              !movingWebsite?.categoryId
                ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                : "text-[#CBC9CF] hover:bg-[#3C3B3D]/50 border border-transparent"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
              />
            </svg>
            <span className="text-sm font-medium">Uncategorized</span>
          </button>

          {categories?.map((category) => (
            <button
              key={category._id}
              onClick={() => handleMoveWebsite(category._id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                movingWebsite?.categoryId === category._id
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                  : "text-[#CBC9CF] hover:bg-[#3C3B3D]/50 border border-transparent"
              }`}
            >
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
