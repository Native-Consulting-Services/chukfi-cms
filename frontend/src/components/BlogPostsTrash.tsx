import React, { useState, useEffect } from "react";
import { RotateCcw, Trash2, Star } from "lucide-react";
import { logActivity } from "../lib/activityLogger";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published";
  author: string;
  featuredImage?: string;
  bannerImage?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export default function BlogPostsTrash() {
  const [deletedPosts, setDeletedPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const loadDeletedPosts = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_blog_posts");
      if (stored) {
        try {
          const parsedPosts: BlogPost[] = JSON.parse(stored);

          // Get only deleted posts
          const deleted = parsedPosts.filter((post) => post.deletedAt);

          // Sort by deletion date (newest first)
          deleted.sort((a, b) => {
            const dateA = new Date(a.deletedAt!).getTime();
            const dateB = new Date(b.deletedAt!).getTime();
            return dateB - dateA;
          });

          setDeletedPosts(deleted);
        } catch (e) {
          console.error("Failed to parse stored posts", e);
          setDeletedPosts([]);
        }
      } else {
        setDeletedPosts([]);
      }
    }
  };

  useEffect(() => {
    loadDeletedPosts();

    const handleUpdate = () => {
      loadDeletedPosts();
    };

    window.addEventListener("blogPostsUpdated", handleUpdate);

    return () => {
      window.removeEventListener("blogPostsUpdated", handleUpdate);
    };
  }, []);

  const handleRestore = (postId: string) => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_blog_posts");
      if (stored) {
        try {
          const parsedPosts: BlogPost[] = JSON.parse(stored);
          const postToRestore = parsedPosts.find((p) => p.id === postId);
          const updatedPosts = parsedPosts.map((p) => {
            if (p.id === postId) {
              const { deletedAt, ...rest } = p;
              return rest;
            }
            return p;
          });
          localStorage.setItem(
            "chukfi_blog_posts",
            JSON.stringify(updatedPosts),
          );
          setDeletedPosts(updatedPosts.filter((p) => p.deletedAt));
          window.dispatchEvent(new CustomEvent("blogPostsUpdated"));

          // Log restore activity to backend
          if (postToRestore) {
            logActivity({
              action: "updated",
              entityType: "blog_post",
              entityId: postId,
              entityName: postToRestore.title,
              metadata: { action: "restored" },
            }).catch((err) => console.error("Failed to log activity:", err));
          }
        } catch (e) {
          console.error("Failed to restore post", e);
        }
      }
    }
  };

  const handlePermanentDelete = (postId: string) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this post? This action cannot be undone.",
      )
    ) {
      return;
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_blog_posts");
      if (stored) {
        try {
          const parsedPosts: BlogPost[] = JSON.parse(stored);
          const postToDelete = parsedPosts.find((p) => p.id === postId);
          const filtered = parsedPosts.filter((p) => p.id !== postId);
          localStorage.setItem("chukfi_blog_posts", JSON.stringify(filtered));
          setDeletedPosts(filtered.filter((p) => p.deletedAt));
          window.dispatchEvent(new CustomEvent("blogPostsUpdated"));

          // Log permanent delete activity to backend
          if (postToDelete) {
            logActivity({
              action: "deleted",
              entityType: "blog_post",
              entityId: postId,
              entityName: postToDelete.title,
              metadata: { permanent: true },
            }).catch((err) => console.error("Failed to log activity:", err));
          }
        } catch (e) {
          console.error("Failed to permanently delete post", e);
        }
      }
    }
  };

  const handleEmptyTrash = () => {
    if (
      !confirm(
        "Are you sure you want to empty the trash? All deleted posts will be permanently removed.",
      )
    ) {
      return;
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_blog_posts");
      if (stored) {
        try {
          const parsedPosts: BlogPost[] = JSON.parse(stored);
          const activePosts = parsedPosts.filter((p) => !p.deletedAt);
          localStorage.setItem(
            "chukfi_blog_posts",
            JSON.stringify(activePosts),
          );
          setDeletedPosts([]);
          window.dispatchEvent(new CustomEvent("blogPostsUpdated"));
        } catch (e) {
          console.error("Failed to empty trash", e);
        }
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const expiryDate = new Date(deletedDate);
    expiryDate.setDate(expiryDate.getDate() + 30);

    const now = new Date();
    const daysRemaining = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    return daysRemaining;
  };

  const filteredPosts = deletedPosts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Trash
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Posts are automatically deleted after 30 days
            </p>
          </div>
          {deletedPosts.length > 0 && (
            <button
              type="button"
              onClick={handleEmptyTrash}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Empty Trash
            </button>
          )}
        </div>
      </div>

      {/* Search and stats */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search deleted posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredPosts.length}{" "}
            {filteredPosts.length === 1 ? "post" : "posts"} in trash
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredPosts.length === 0 ? (
        <div className="px-6 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <svg
                className="h-16 w-16 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Trash is empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Deleted posts will appear here
            </p>
          </div>
        </div>
      ) : (
        <div className="px-6 py-6">
          {/* Desktop: Table view */}
          <div className="hidden lg:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Deleted
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Days Remaining
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-800">
                {filteredPosts.map((post) => {
                  const daysRemaining = getDaysRemaining(post.deletedAt!);
                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center gap-2">
                          {post.featured && (
                            <span>
                              <Star
                                className="h-4 w-4 text-yellow-500 fill-yellow-500"
                                aria-label="Featured"
                              />
                            </span>
                          )}
                          <div className="flex flex-col">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {post.title}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                              /{post.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(post.deletedAt)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            daysRemaining <= 7
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleRestore(post.id)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                            title="Restore"
                          >
                            <RotateCcw className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePermanentDelete(post.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            title="Delete Permanently"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet: Card view */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredPosts.map((post) => {
              const daysRemaining = getDaysRemaining(post.deletedAt!);
              return (
                <div
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 p-5"
                >
                  {/* Header: Title and Featured Star */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        /{post.slug}
                      </p>
                    </div>
                    {post.featured && (
                      <Star
                        className="h-5 w-5 text-yellow-500 fill-yellow-500 flex-shrink-0"
                        aria-label="Featured"
                      />
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Deleted {formatDate(post.deletedAt)}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      •
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        daysRemaining <= 7
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {daysRemaining} {daysRemaining === 1 ? "day" : "days"}{" "}
                      left
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => handleRestore(post.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePermanentDelete(post.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
