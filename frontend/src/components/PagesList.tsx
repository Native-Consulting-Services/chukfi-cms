import { useState, useEffect } from "react";
import { Pencil, Trash2, Eye } from "lucide-react";

interface Page {
  id: string;
  title: string;
  slug: string;
  blocks: Block[];
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

interface Block {
  id: string;
  type: string;
  content: any;
  settings?: Record<string, any>;
}

export default function PagesList() {
  const [pages, setPages] = useState<Page[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "published"
  >("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);

  const loadPages = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_pages");
      let parsedPages: Page[] = [];

      if (stored) {
        try {
          parsedPages = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse stored pages", e);
          parsedPages = [];
        }
      }

      // Initialize home page if it doesn't exist
      const hasHomePage = parsedPages.some((p) => p.isHomePage && !p.deletedAt);
      if (!hasHomePage) {
        const homePage: Page = {
          id: "home-page",
          title: "Home",
          slug: "",
          blocks: [],
          layout: "default",
          status: "published",
          seo: {
            title: "Home",
            description: "Welcome to our website",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isHomePage: true,
        };
        parsedPages.unshift(homePage);
        localStorage.setItem("chukfi_pages", JSON.stringify(parsedPages));
      }

      const activePages = parsedPages.filter((page) => !page.deletedAt);
      setPages(activePages);
    }
  };

  useEffect(() => {
    loadPages();

    const handleUpdate = () => {
      loadPages();
    };

    window.addEventListener("pagesUpdated" as any, handleUpdate);

    return () => {
      window.removeEventListener("pagesUpdated" as any, handleUpdate);
    };
  }, []);

  const handleDelete = (page: Page) => {
    if (page.isHomePage) {
      alert("The home page cannot be deleted.");
      return;
    }
    setPageToDelete(page);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!pageToDelete) return;

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_pages");
      if (stored) {
        try {
          const parsedPages: Page[] = JSON.parse(stored);
          const updatedPages = parsedPages.map((p) =>
            p.id === pageToDelete.id
              ? { ...p, deletedAt: new Date().toISOString() }
              : p,
          );
          localStorage.setItem("chukfi_pages", JSON.stringify(updatedPages));
          setPages(updatedPages.filter((p) => !p.deletedAt));
          window.dispatchEvent(new CustomEvent("pagesUpdated"));
        } catch (e) {
          console.error("Failed to delete page", e);
        }
      }
    }

    setShowDeleteModal(false);
    setPageToDelete(null);
  };

  const filteredPages = pages
    .filter((page) => {
      const matchesSearch =
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || page.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Always keep home page at the top
      if (a.isHomePage) return -1;
      if (b.isHomePage) return 1;
      // Sort others by updated date
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const publishedCount = pages.filter((p) => p.status === "published").length;
  const draftCount = pages.filter((p) => p.status === "draft").length;

  return (
    <div>
      {/* Stats */}
      <div className="mb-6">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 px-4 py-5 dark:bg-gray-700/50">
            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Pages
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {pages.length}
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
        </dl>
      </div>

      {/* Filter bar */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-lg flex-1">
            <input
              type="search"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 text-gray-900 ring-1 shadow-sm ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-600 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "draft" | "published")
              }
              className="block rounded-md border-0 bg-white py-1.5 pr-10 pl-3 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-600 dark:focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pages table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
              >
                Page
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
              >
                Layout
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
              >
                Updated
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {filteredPages.map((page) => (
              <tr
                key={page.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {page.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        /{page.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                      page.status === "published"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {page.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {page.layout}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {new Date(page.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Preview"
                    >
                      <Eye className="h-5 w-5" />
                    </a>
                    <a
                      href={`/admin/pages/edit?id=${page.id}`}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      title="Edit"
                    >
                      <Pencil className="h-5 w-5" />
                    </a>
                    {!page.isHomePage && (
                      <button
                        type="button"
                        onClick={() => handleDelete(page)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {filteredPages.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== "all"
              ? "No pages found matching your criteria."
              : "No pages yet. Create your first page to get started."}
          </p>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black opacity-75"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-4 shadow-xl sm:p-6 dark:bg-gray-800">
            <h3 className="mb-3 text-lg font-medium text-gray-900 sm:mb-4 dark:text-white">
              Delete Page
            </h3>
            <p className="mb-4 text-sm text-gray-500 sm:mb-6 dark:text-gray-400">
              Are you sure you want to delete "{pageToDelete?.title}"? This
              action can be undone from the trash.
            </p>
            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:px-4 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 sm:px-4"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
