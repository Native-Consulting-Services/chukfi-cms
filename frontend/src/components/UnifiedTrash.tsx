import { useState, useEffect } from "react";
import { RotateCcw, Trash2, FileText, FileCode } from "lucide-react";

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

interface Page {
  id: string;
  title: string;
  slug: string;
  blocks: any[];
  layout: "default" | "full-width" | "sidebar";
  status: "draft" | "published";
  seo: {
    title: string;
    description: string;
    ogImage?: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  isHomePage?: boolean;
}

interface TrashItem {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  deletedAt: string;
  type: "post" | "page";
  originalData: BlogPost | Page;
}

export default function UnifiedTrash() {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "post" | "page">("all");

  const loadTrashItems = () => {
    if (typeof window !== "undefined") {
      const items: TrashItem[] = [];

      // Load deleted blog posts
      const storedPosts = localStorage.getItem("chukfi_blog_posts");
      if (storedPosts) {
        try {
          const parsedPosts: BlogPost[] = JSON.parse(storedPosts);
          const deletedPosts = parsedPosts.filter((post) => post.deletedAt);
          deletedPosts.forEach((post) => {
            items.push({
              id: `post-${post.id}`,
              title: post.title,
              slug: post.slug,
              status: post.status,
              deletedAt: post.deletedAt!,
              type: "post",
              originalData: post,
            });
          });
        } catch (e) {
          console.error("Failed to parse stored posts", e);
        }
      }

      // Load deleted pages
      const storedPages = localStorage.getItem("chukfi_pages");
      if (storedPages) {
        try {
          const parsedPages: Page[] = JSON.parse(storedPages);
          const deletedPages = parsedPages.filter((page) => page.deletedAt);
          deletedPages.forEach((page) => {
            items.push({
              id: `page-${page.id}`,
              title: page.title,
              slug: page.slug,
              status: page.status,
              deletedAt: page.deletedAt!,
              type: "page",
              originalData: page,
            });
          });
        } catch (e) {
          console.error("Failed to parse stored pages", e);
        }
      }

      // Sort by deletion date (newest first)
      items.sort((a, b) => {
        const dateA = new Date(a.deletedAt).getTime();
        const dateB = new Date(b.deletedAt).getTime();
        return dateB - dateA;
      });

      setTrashItems(items);
    }
  };

  useEffect(() => {
    loadTrashItems();

    const handleUpdate = () => {
      loadTrashItems();
    };

    window.addEventListener("blogPostsUpdated", handleUpdate);
    window.addEventListener("pagesUpdated" as any, handleUpdate);

    return () => {
      window.removeEventListener("blogPostsUpdated", handleUpdate);
      window.removeEventListener("pagesUpdated" as any, handleUpdate);
    };
  }, []);

  const handleRestore = (item: TrashItem) => {
    if (typeof window !== "undefined") {
      if (item.type === "post") {
        const stored = localStorage.getItem("chukfi_blog_posts");
        if (stored) {
          try {
            const parsedPosts: BlogPost[] = JSON.parse(stored);
            const updatedPosts = parsedPosts.map((p: BlogPost) => {
              if (p.id === (item.originalData as BlogPost).id) {
                const { deletedAt, ...rest } = p;
                return rest as BlogPost;
              }
              return p;
            });
            localStorage.setItem(
              "chukfi_blog_posts",
              JSON.stringify(updatedPosts),
            );
            window.dispatchEvent(new CustomEvent("blogPostsUpdated"));
          } catch (e) {
            console.error("Failed to restore post", e);
          }
        }
      } else if (item.type === "page") {
        const stored = localStorage.getItem("chukfi_pages");
        if (stored) {
          try {
            const parsedPages: Page[] = JSON.parse(stored);
            const updatedPages = parsedPages.map((p: Page) => {
              if (p.id === (item.originalData as Page).id) {
                const { deletedAt, ...rest } = p;
                return rest as Page;
              }
              return p;
            });
            localStorage.setItem("chukfi_pages", JSON.stringify(updatedPages));
            window.dispatchEvent(new CustomEvent("pagesUpdated"));
          } catch (e) {
            console.error("Failed to restore page", e);
          }
        }
      }
    }
  };

  const handlePermanentDelete = (item: TrashItem) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete this ${item.type}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    if (typeof window !== "undefined") {
      if (item.type === "post") {
        const stored = localStorage.getItem("chukfi_blog_posts");
        if (stored) {
          try {
            const parsedPosts: BlogPost[] = JSON.parse(stored);
            const updatedPosts = parsedPosts.filter(
              (p: BlogPost) => p.id !== (item.originalData as BlogPost).id,
            );
            localStorage.setItem(
              "chukfi_blog_posts",
              JSON.stringify(updatedPosts),
            );
            window.dispatchEvent(new CustomEvent("blogPostsUpdated"));
          } catch (e) {
            console.error("Failed to delete post", e);
          }
        }
      } else if (item.type === "page") {
        const stored = localStorage.getItem("chukfi_pages");
        if (stored) {
          try {
            const parsedPages: Page[] = JSON.parse(stored);
            const updatedPages = parsedPages.filter(
              (p: Page) => p.id !== (item.originalData as Page).id,
            );
            localStorage.setItem("chukfi_pages", JSON.stringify(updatedPages));
            window.dispatchEvent(new CustomEvent("pagesUpdated"));
          } catch (e) {
            console.error("Failed to delete page", e);
          }
        }
      }
    }
  };

  const handleEmptyTrash = () => {
    if (
      !confirm(
        "Are you sure you want to permanently delete all items in trash? This action cannot be undone.",
      )
    ) {
      return;
    }

    if (typeof window !== "undefined") {
      // Empty posts
      const storedPosts = localStorage.getItem("chukfi_blog_posts");
      if (storedPosts) {
        try {
          const parsedPosts: BlogPost[] = JSON.parse(storedPosts);
          const updatedPosts = parsedPosts.filter(
            (p: BlogPost) => !p.deletedAt,
          );
          localStorage.setItem(
            "chukfi_blog_posts",
            JSON.stringify(updatedPosts),
          );
          window.dispatchEvent(new CustomEvent("blogPostsUpdated"));
        } catch (e) {
          console.error("Failed to empty posts trash", e);
        }
      }

      // Empty pages
      const storedPages = localStorage.getItem("chukfi_pages");
      if (storedPages) {
        try {
          const parsedPages: Page[] = JSON.parse(storedPages);
          const updatedPages = parsedPages.filter((p: Page) => !p.deletedAt);
          localStorage.setItem("chukfi_pages", JSON.stringify(updatedPages));
          window.dispatchEvent(new CustomEvent("pagesUpdated"));
        } catch (e) {
          console.error("Failed to empty pages trash", e);
        }
      }
    }
  };

  const filteredItems = trashItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const postCount = trashItems.filter((item) => item.type === "post").length;
  const pageCount = trashItems.filter((item) => item.type === "page").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Trash
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {trashItems.length === 0
              ? "No deleted items"
              : `${postCount} post${postCount === 1 ? "" : "s"}, ${pageCount} page${pageCount === 1 ? "" : "s"}`}
          </p>
        </div>
        {trashItems.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Empty Trash
          </button>
        )}
      </div>

      {/* Filters */}
      {trashItems.length > 0 && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <input
              type="search"
              placeholder="Search deleted items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 bg-white py-2 pr-10 pl-3 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-600 dark:placeholder:text-gray-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                filterType === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
              }`}
            >
              All ({trashItems.length})
            </button>
            <button
              onClick={() => setFilterType("post")}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                filterType === "post"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
              }`}
            >
              Posts ({postCount})
            </button>
            <button
              onClick={() => setFilterType("page")}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                filterType === "page"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
              }`}
            >
              Pages ({pageCount})
            </button>
          </div>
        </div>
      )}

      {/* Items table */}
      {filteredItems.length > 0 ? (
        <div className="ring-opacity-5 overflow-hidden bg-white ring-1 shadow ring-black sm:rounded-lg dark:bg-gray-800 dark:ring-gray-700">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6 dark:text-gray-100"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
                >
                  Deleted
                </th>
                <th scope="col" className="relative py-3.5 pr-4 pl-3 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                    <div className="flex items-center gap-3">
                      {item.type === "post" ? (
                        <FileText className="h-5 w-5 text-blue-500" />
                      ) : (
                        <FileCode className="h-5 w-5 text-purple-500" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {item.title}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {item.type === "page" && !item.slug
                            ? "/"
                            : `/${item.slug}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    <span className="capitalize">{item.type}</span>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                        item.status === "published"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {new Date(item.deletedAt).toLocaleString()}
                  </td>
                  <td className="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRestore(item)}
                        className="rounded-md p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
                        title="Restore"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(item)}
                        className="rounded-md p-2 text-red-600 hover:bg-red-50 hover:text-red-900 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                        title="Delete permanently"
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
      ) : (
        <div className="rounded-lg bg-gray-50 p-12 text-center dark:bg-gray-900">
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            {searchTerm || filterType !== "all"
              ? "No matching items"
              : "No deleted items"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || filterType !== "all"
              ? "Try adjusting your search or filter."
              : "Deleted posts and pages will appear here."}
          </p>
        </div>
      )}
    </div>
  );
}
