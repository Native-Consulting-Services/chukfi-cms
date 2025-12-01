import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Star } from "lucide-react";
import { logActivity } from "../lib/activityLogger";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published" | "scheduled";
  author: string;
  featuredImage?: string;
  bannerImage?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  publishAt?: string;
}

export default function BlogPostsList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "published" | "scheduled"
  >("all");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "title">(
    "updated",
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);

  const loadPosts = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_blog_posts");
      if (stored) {
        try {
          const parsedPosts: BlogPost[] = JSON.parse(stored);

          // Clean up posts deleted more than 30 days ago
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const now = new Date();
          let postsUpdated = false;

          const cleanedPosts = parsedPosts
            .filter((post) => {
              if (post.deletedAt) {
                const deletedDate = new Date(post.deletedAt);
                return deletedDate > thirtyDaysAgo;
              }
              return true;
            })
            .map((post) => {
              // Auto-publish scheduled posts that have reached their publish date
              if (post.status === "scheduled" && post.publishAt) {
                const publishDate = new Date(post.publishAt);
                if (publishDate <= now) {
                  postsUpdated = true;
                  return { ...post, status: "published" as const };
                }
              }
              return post;
            });

          // Save back to localStorage if any changes were made
          if (cleanedPosts.length !== parsedPosts.length || postsUpdated) {
            localStorage.setItem(
              "chukfi_blog_posts",
              JSON.stringify(cleanedPosts),
            );
          }

          // Filter out soft-deleted posts for display
          const activePosts = cleanedPosts.filter((post) => !post.deletedAt);
          setPosts(activePosts);
        } catch (e) {
          console.error("Failed to parse stored posts", e);
          setPosts([]);
        }
      } else {
        setPosts([]);
      }
    }
  };

  useEffect(() => {
    loadPosts();

    const handleUpdate = () => {
      loadPosts();
    };

    window.addEventListener("blogPostsUpdated" as any, handleUpdate);

    return () => {
      window.removeEventListener("blogPostsUpdated" as any, handleUpdate);
    };
  }, []);

  const handleDelete = (post: BlogPost) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!postToDelete) return;

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_blog_posts");
      if (stored) {
        try {
          const parsedPosts: BlogPost[] = JSON.parse(stored);
          const updatedPosts = parsedPosts.map((p) =>
            p.id === postToDelete.id
              ? { ...p, deletedAt: new Date().toISOString() }
              : p,
          );
          localStorage.setItem(
            "chukfi_blog_posts",
            JSON.stringify(updatedPosts),
          );
          setPosts(updatedPosts.filter((p) => !p.deletedAt));
          window.dispatchEvent(new CustomEvent("blogPostsUpdated"));

          // Log delete activity to backend
          logActivity({
            action: "deleted",
            entityType: "blog_post",
            entityId: postToDelete.id,
            entityName: postToDelete.title,
          }).catch((err) => console.error("Failed to log activity:", err));

          setShowDeleteModal(false);
          setPostToDelete(null);
        } catch (e) {
          console.error("Failed to delete post", e);
        }
      }
    }
  };

  const filteredPosts = posts
    .filter((post) => {
      if (statusFilter !== "all" && post.status !== statusFilter) return false;
      if (
        searchTerm &&
        !post.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "created":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        case "updated":
        default:
          return (
            new Date(b.updatedAt || 0).getTime() -
            new Date(a.updatedAt || 0).getTime()
          );
      }
    });

  const totalPosts = posts.length;
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="px-4 py-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Total Posts
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {totalPosts}
            </dd>
          </div>
          <div className="px-4 py-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Published
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {publishedCount}
            </dd>
          </div>
          <div className="px-4 py-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Drafts
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {draftCount}
            </dd>
          </div>
          <div className="px-4 py-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Scheduled
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {scheduledCount}
            </dd>
          </div>
        </dl>
      </div>

      {/* Filter bar */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <label htmlFor="search" className="sr-only">
              Search posts
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="search"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-0 bg-white dark:bg-gray-900 py-2 pl-10 pr-3 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
                placeholder="Search posts..."
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "draft" | "published" | "scheduled",
                )
              }
              className="block rounded-md border-0 bg-white dark:bg-gray-900 py-2 pl-3 pr-10 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "updated" | "created" | "title")
              }
              className="block rounded-md border-0 bg-white dark:bg-gray-900 py-2 pl-3 pr-10 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Date Created</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts list or empty state */}
      {filteredPosts.length === 0 ? (
        <div className="p-12 pb-16">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {posts.length === 0
                ? "No blog posts yet"
                : "No posts match your filters"}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {posts.length === 0
                ? "Get started by creating your first blog post."
                : "Try adjusting your search or filters."}
            </p>
            {posts.length === 0 && (
              <div className="mt-6">
                <a
                  href="/admin/blog_posts/new"
                  className="inline-flex items-center rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  New Post
                </a>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="px-6 pb-6">
          {/* Desktop: Table view (hidden on mobile) */}
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
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Author
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Updated
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Schedule Date
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-800">
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center gap-2">
                        {post.featured && (
                          <span title="Featured">
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
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          post.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : post.status === "scheduled"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {post.status === "published"
                          ? "Published"
                          : post.status === "scheduled"
                            ? "Scheduled"
                            : "Draft"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {post.author}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(post.updatedAt)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {post.status === "scheduled" && post.publishAt ? (
                        <span className="text-blue-600 dark:text-blue-400">
                          {formatDate(post.publishAt)}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">
                          —
                        </span>
                      )}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/admin/blog_posts/${post.id}/edit`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                          title="Edit"
                        >
                          <Pencil className="h-5 w-5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(post)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet: Card view */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredPosts.map((post) => (
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
                      title="Featured"
                    />
                  )}
                </div>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      post.status === "published"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : post.status === "scheduled"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {post.status === "published"
                      ? "Published"
                      : post.status === "scheduled"
                        ? "Scheduled"
                        : "Draft"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    By {post.author}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    •
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Created {formatDate(post.createdAt)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    •
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Updated {formatDate(post.updatedAt)}
                  </span>
                  {post.status === "scheduled" && post.publishAt && (
                    <>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        •
                      </span>
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        Publishes {formatDate(post.publishAt)}
                      </span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={`/admin/blog_posts/${post.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(post)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && postToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Post
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{postToDelete.title}"? It will be
              moved to trash and automatically deleted after 30 days.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setPostToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
