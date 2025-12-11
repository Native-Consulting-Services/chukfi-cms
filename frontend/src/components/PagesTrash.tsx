import { useState, useEffect } from "react";
import { RotateCcw, Trash2 } from "lucide-react";

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

export default function PagesTrash() {
  const [deletedPages, setDeletedPages] = useState<Page[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const loadDeletedPages = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_pages");
      if (stored) {
        try {
          const parsedPages: Page[] = JSON.parse(stored);

          // Get only deleted pages
          const deleted = parsedPages.filter((page) => page.deletedAt);

          // Sort by deletion date (newest first)
          deleted.sort((a, b) => {
            const dateA = new Date(a.deletedAt!).getTime();
            const dateB = new Date(b.deletedAt!).getTime();
            return dateB - dateA;
          });

          setDeletedPages(deleted);
        } catch (e) {
          console.error("Failed to parse stored pages", e);
          setDeletedPages([]);
        }
      } else {
        setDeletedPages([]);
      }
    }
  };

  useEffect(() => {
    loadDeletedPages();

    const handleUpdate = () => {
      loadDeletedPages();
    };

    window.addEventListener("pagesUpdated" as any, handleUpdate);

    return () => {
      window.removeEventListener("pagesUpdated" as any, handleUpdate);
    };
  }, []);

  const handleRestore = (pageId: string) => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_pages");
      if (stored) {
        try {
          const parsedPages: Page[] = JSON.parse(stored);
          const updatedPages = parsedPages.map((p: Page) => {
            if (p.id === pageId) {
              const { deletedAt, ...rest } = p;
              return rest as Page;
            }
            return p;
          });
          localStorage.setItem("chukfi_pages", JSON.stringify(updatedPages));
          setDeletedPages(
            updatedPages.filter((p: Page) => p.deletedAt) as Page[],
          );
          window.dispatchEvent(new CustomEvent("pagesUpdated"));
        } catch (e) {
          console.error("Failed to restore page", e);
        }
      }
    }
  };

  const handlePermanentDelete = (pageId: string) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this page? This action cannot be undone.",
      )
    ) {
      return;
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_pages");
      if (stored) {
        try {
          const parsedPages: Page[] = JSON.parse(stored);
          const updatedPages = parsedPages.filter((p: Page) => p.id !== pageId);
          localStorage.setItem("chukfi_pages", JSON.stringify(updatedPages));
          setDeletedPages(
            updatedPages.filter((p: Page) => p.deletedAt) as Page[],
          );
          window.dispatchEvent(new CustomEvent("pagesUpdated"));
        } catch (e) {
          console.error("Failed to delete page", e);
        }
      }
    }
  };

  const handleEmptyTrash = () => {
    if (
      !confirm(
        "Are you sure you want to permanently delete all pages in trash? This action cannot be undone.",
      )
    ) {
      return;
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_pages");
      if (stored) {
        try {
          const parsedPages: Page[] = JSON.parse(stored);
          const updatedPages = parsedPages.filter((p: Page) => !p.deletedAt);
          localStorage.setItem("chukfi_pages", JSON.stringify(updatedPages));
          setDeletedPages([]);
          window.dispatchEvent(new CustomEvent("pagesUpdated"));
        } catch (e) {
          console.error("Failed to empty trash", e);
        }
      }
    }
  };

  const filteredPages = deletedPages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Deleted Pages
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {deletedPages.length === 0
              ? "No deleted pages"
              : `${deletedPages.length} page${deletedPages.length === 1 ? "" : "s"} in trash`}
          </p>
        </div>
        {deletedPages.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Empty Trash
          </button>
        )}
      </div>

      {/* Search */}
      {deletedPages.length > 0 && (
        <div className="mb-6">
          <input
            type="search"
            placeholder="Search deleted pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full max-w-lg rounded-md border-0 bg-white py-2 pr-10 pl-3 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-600 dark:placeholder:text-gray-500"
          />
        </div>
      )}

      {/* Pages list */}
      {filteredPages.length > 0 ? (
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
              {filteredPages.map((page) => (
                <tr key={page.id}>
                  <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {page.title}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">
                      /{page.slug || "(home)"}
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap">
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
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {page.deletedAt &&
                      new Date(page.deletedAt).toLocaleString()}
                  </td>
                  <td className="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRestore(page.id)}
                        className="rounded-md p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
                        title="Restore"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(page.id)}
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
            {searchTerm ? "No matching pages" : "No deleted pages"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Deleted pages will appear here."}
          </p>
        </div>
      )}
    </div>
  );
}
