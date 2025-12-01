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
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-gray-50 px-4 py-5 dark:bg-gray-700/50">
            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Posts
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {totalPosts}
            </dd>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-5 dark:bg-gray-700/50">
            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              Published
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {publishedCount}
            </dd>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-5 dark:bg-gray-700/50">
            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              Drafts
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {draftCount}
            </dd>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-5 dark:bg-gray-700/50">
            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              Scheduled
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {scheduledCount}
            </dd>
          </div>
        </dl>
      </div>

      {/* Filter bar */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg flex-1">
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
                className="block w-full rounded-md border-0 bg-white py-2 pr-3 pl-10 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
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
              className="block rounded-md border-0 bg-white py-2 pr-10 pl-3 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
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
              className="block rounded-md border-0 bg-white py-2 pr-10 pl-3 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
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
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
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
          <div className="ring-opacity-5 hidden overflow-hidden rounded-lg ring-1 shadow ring-black lg:block dark:ring-gray-700">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-white"
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
                  <th scope="col" className="relative py-3.5 pr-4 pl-3 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-800">
                {filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                      <div className="flex items-center gap-2">
                        {post.featured && (
                          <span title="Featured">
                            <Star
                              className="h-4 w-4 fill-yellow-500 text-yellow-500"
                              aria-label="Featured"
                            />
                          </span>
                        )}
                        <div className="flex flex-col">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {post.title}
                          </div>
                          <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            /{post.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap">
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
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {post.author}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {formatDate(post.updatedAt)}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap">
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
                    <td className="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/admin/blog_posts/${post.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Edit"
                        >
                          <Pencil className="h-5 w-5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(post)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="ring-opacity-5 rounded-lg bg-white p-5 ring-1 shadow ring-black transition-shadow hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
              >
                {/* Header: Title and Featured Star */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                      {post.title}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                      /{post.slug}
                    </p>
                  </div>
                  {post.featured && (
                    <Star
                      className="h-5 w-5 flex-shrink-0 fill-yellow-500 text-yellow-500"
                      aria-label="Featured"
                    />
                  )}
                </div>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                    {post.excerpt}
                  </p>
                )}

                {/* Metadata */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
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
                <div className="flex items-center gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                  <a
                    href={`/admin/blog_posts/${post.id}/edit`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(post)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
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
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Post
              </h3>
            </div>

            <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
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
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
