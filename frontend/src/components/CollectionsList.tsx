import { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";

interface Collection {
  id: string;
  name: string;
  displayName: string;
  description: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
  status: "active" | "disabled";
  icon?: string;
  color?: string;
  isSystem?: boolean;
}

// Mock data - replace with actual API call
const mockCollections: Collection[] = [
  {
    id: "1",
    name: "blog_posts",
    displayName: "Blog Posts",
    description: "Articles and blog content for the website",
    documentCount: 45,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-11-20T14:22:00Z",
    status: "active",
    icon: "FileText",
    color: "blue",
    isSystem: true,
  },
  {
    id: "2",
    name: "pages",
    displayName: "Pages",
    description: "Static pages and landing pages",
    documentCount: 12,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-11-18T09:15:00Z",
    status: "active",
    icon: "FileCode",
    color: "purple",
    isSystem: true,
  },
  {
    id: "3",
    name: "products",
    displayName: "Products",
    description: "E-commerce product catalog",
    documentCount: 89,
    createdAt: "2024-02-03T16:45:00Z",
    updatedAt: "2024-11-22T11:30:00Z",
    status: "active",
    icon: "ShoppingCart",
    color: "green",
  },
  {
    id: "4",
    name: "team_members",
    displayName: "Team Members",
    description: "Staff and team member profiles",
    documentCount: 8,
    createdAt: "2024-02-10T12:20:00Z",
    updatedAt: "2024-10-15T13:45:00Z",
    status: "active",
    icon: "Users",
    color: "indigo",
  },
  {
    id: "5",
    name: "testimonials",
    displayName: "Testimonials",
    description: "Customer reviews and testimonials",
    documentCount: 23,
    createdAt: "2024-03-01T08:10:00Z",
    updatedAt: "2024-11-19T16:20:00Z",
    status: "active",
    icon: "MessageSquare",
    color: "amber",
  },
  {
    id: "6",
    name: "events",
    displayName: "Events",
    description: "Upcoming events and workshops",
    documentCount: 15,
    createdAt: "2024-03-15T14:30:00Z",
    updatedAt: "2024-11-21T10:10:00Z",
    status: "active",
    icon: "Calendar",
    color: "rose",
  },
  {
    id: "7",
    name: "media",
    displayName: "Media",
    description: "Images, videos, and other media files",
    documentCount: 156,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-11-23T12:05:00Z",
    status: "active",
    icon: "Image",
    color: "cyan",
    isSystem: true,
  },
  {
    id: "8",
    name: "settings",
    displayName: "Settings",
    description: "Site configuration and settings",
    documentCount: 1,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-11-20T15:30:00Z",
    status: "active",
    icon: "Settings",
    color: "gray",
    isSystem: true,
  },
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getIconComponent = (iconName?: string) => {
  if (!iconName) return LucideIcons.Folder;
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.Folder;
};

const getColorHex = (colorName?: string): string => {
  const colorMap: Record<string, string> = {
    gray: "#6b7280",
    red: "#ef4444",
    orange: "#f97316",
    amber: "#f59e0b",
    yellow: "#eab308",
    lime: "#84cc16",
    green: "#22c55e",
    emerald: "#10b981",
    teal: "#14b8a6",
    cyan: "#06b6d4",
    sky: "#0ea5e9",
    blue: "#3b82f6",
    indigo: "#6366f1",
    violet: "#8b5cf6",
    purple: "#a855f7",
    fuchsia: "#d946ef",
    pink: "#ec4899",
    rose: "#f43f5e",
  };
  return colorMap[colorName || "indigo"] || "#6366f1";
};

export default function CollectionsList() {
  const [collections, setCollections] = useState<Collection[]>(mockCollections);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Collection>("displayName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "disabled"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load from localStorage on mount
  useEffect(() => {
    console.log("[CollectionsList] Component mounted");
    console.log("[CollectionsList] Initial collections:", collections);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_collections");
      console.log("[CollectionsList] Stored data:", stored);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log("[CollectionsList] Parsed collections:", parsed);
          // Validate parsed data has correct structure
          if (Array.isArray(parsed) && parsed.length > 0) {
            const isValid = parsed.every(
              (item) => item && item.displayName && item.description,
            );
            if (isValid) {
              setCollections(parsed);
            } else {
              console.warn(
                "[CollectionsList] Invalid data in localStorage, using mock data",
              );
              localStorage.removeItem("chukfi_collections");
            }
          }
        } catch (e) {
          console.error("Failed to parse stored collections", e);
          localStorage.removeItem("chukfi_collections");
        }
      }
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever collections change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chukfi_collections", JSON.stringify(collections));
      // Dispatch event after saving to ensure other components get fresh data
      window.dispatchEvent(new CustomEvent("collectionsStorageUpdated"));
    }
  }, [collections]);

  // Listen for new collection events
  useEffect(() => {
    const handleNewCollection = (event: CustomEvent) => {
      const newCollectionData = event.detail;
      const newCollection: Collection = {
        id: Date.now().toString(),
        name: newCollectionData.name,
        displayName: newCollectionData.displayName,
        description: newCollectionData.description,
        documentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "active",
        icon: newCollectionData.icon,
        color: newCollectionData.color,
      };
      setCollections((prev) => [...prev, newCollection]);
    };

    const handleCollectionUpdate = (event: CustomEvent) => {
      const updatedData = event.detail;
      setCollections((prev) =>
        prev.map((col) =>
          col.id === updatedData.id
            ? {
                ...col,
                displayName: updatedData.displayName,
                description: updatedData.description,
                icon: updatedData.icon,
                color: updatedData.color,
                status: updatedData.status,
                updatedAt: new Date().toISOString(),
              }
            : col,
        ),
      );
    };

    window.addEventListener(
      "newCollectionCreated" as any,
      handleNewCollection as any,
    );
    window.addEventListener(
      "collectionUpdated" as any,
      handleCollectionUpdate as any,
    );

    return () => {
      window.removeEventListener(
        "newCollectionCreated" as any,
        handleNewCollection as any,
      );
      window.removeEventListener(
        "collectionUpdated" as any,
        handleCollectionUpdate as any,
      );
    };
  }, []);

  // Scroll to top when new collection is added
  useEffect(() => {
    if (collections.length > mockCollections.length) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [collections.length]);

  // Filter and sort collections
  const filteredCollections = collections
    .filter((collection) => {
      // Validate collection has required fields
      if (!collection || !collection.displayName || !collection.description) {
        console.warn("[CollectionsList] Invalid collection:", collection);
        return false;
      }
      const matchesSearch =
        collection.displayName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || collection.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * direction;
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * direction;
      }
      return 0;
    });

  // Pagination
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCollections = filteredCollections.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  console.log(
    "[CollectionsList] Render - collections:",
    collections.length,
    "filtered:",
    filteredCollections.length,
    "loading:",
    isLoading,
  );

  const handleSort = (field: keyof Collection) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDeleteCollection = (id: string) => {
    const collection = collections.find((c) => c.id === id);
    if (collection?.isSystem) {
      alert(
        "This is a system collection and cannot be deleted. System collections are essential for the CMS to function properly.",
      );
      return;
    }
    if (
      confirm(
        "Are you sure you want to delete this collection? This action cannot be undone.",
      )
    ) {
      setCollections(collections.filter((c) => c.id !== id));
    }
  };

  const handleEditCollection = (collection: Collection) => {
    window.dispatchEvent(
      new CustomEvent("openEditCollectionModal", {
        detail: collection,
      }),
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <div className="text-gray-500 dark:text-gray-400">
          Loading collections...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Search and filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        {/* Search */}
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search collections
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400 dark:text-gray-500"
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
              id="search"
              name="search"
              type="search"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 text-gray-900 ring-1 shadow-sm ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Status filter */}
        <div>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as "all" | "active" | "disabled")
            }
            className="block w-full rounded-md border-0 bg-white py-1.5 pr-10 pl-3 text-gray-900 ring-1 shadow-sm ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 dark:focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        {/* Results count */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          {filteredCollections.length} of {collections.length} collections
        </div>
      </div>

      {/* Collections table */}
      <div className="mt-6 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="cursor-pointer py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 sm:pl-0 dark:text-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSort("displayName")}
                  >
                    <div className="group inline-flex">
                      Collection
                      <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible dark:text-gray-500">
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSort("documentCount")}
                  >
                    <div className="group inline-flex">
                      Documents
                      <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible dark:text-gray-500">
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSort("status")}
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="cursor-pointer px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800"
                    onClick={() => handleSort("updatedAt")}
                  >
                    <div className="group inline-flex">
                      Last Updated
                      <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible dark:text-gray-500">
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                  </th>
                  <th scope="col" className="relative py-3.5 pr-4 pl-3 sm:pr-0">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedCollections.map((collection) => (
                  <tr
                    key={collection.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() =>
                      (window.location.href = `/admin/${collection.name}`)
                    }
                  >
                    <td className="py-4 pr-3 pl-4 whitespace-nowrap sm:pl-0">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor: `${getColorHex(collection.color)}20`,
                            }}
                          >
                            {(() => {
                              const Icon = getIconComponent(collection.icon);
                              return (
                                <Icon
                                  className="h-6 w-6"
                                  style={{
                                    color: getColorHex(collection.color),
                                  }}
                                />
                              );
                            })()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <a
                            href={`/admin/${collection.name}`}
                            className="font-medium text-gray-900 hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {collection.displayName}
                          </a>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {collection.description}
                          </div>
                          <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            API:{" "}
                            <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">
                              /api/v1/collections/{collection.name}
                            </code>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">
                      <div className="flex items-center">
                        <span className="font-medium">
                          {collection.documentCount}
                        </span>
                        <span className="ml-1 text-gray-500 dark:text-gray-400">
                          items
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                          collection.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {collection.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      <div>
                        <div title={formatDateTime(collection.updatedAt)}>
                          {formatDate(collection.updatedAt)}
                        </div>
                      </div>
                    </td>
                    <td className="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCollection(collection);
                          }}
                          className="rounded-md p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
                          title="Edit collection"
                        >
                          <LucideIcons.Pencil className="h-5 w-5" />
                        </button>

                        {/* Delete button - disabled for Events, Products, Team Members, and Testimonials */}
                        {!collection.isSystem &&
                          ![
                            "events",
                            "products",
                            "team_members",
                            "testimonials",
                          ].includes(collection.name) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCollection(collection.id);
                              }}
                              className="rounded-md p-2 text-red-600 hover:bg-red-50 hover:text-red-900 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                              title="Delete collection"
                            >
                              <LucideIcons.Trash2 className="h-5 w-5" />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filteredCollections.length === 0 && (
        <div className="py-12 text-center">
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
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            ></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No collections found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Get started by creating your first collection."}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
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
                New Collection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && filteredCollections.length > 0 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(endIndex, filteredCollections.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {filteredCollections.length}
                </span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-gray-600 dark:hover:bg-gray-700"
                >
                  <span className="sr-only">Previous</span>
                  <LucideIcons.ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === page
                          ? "z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          : "text-gray-900 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-gray-600 dark:hover:bg-gray-700"
                >
                  <span className="sr-only">Next</span>
                  <LucideIcons.ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
