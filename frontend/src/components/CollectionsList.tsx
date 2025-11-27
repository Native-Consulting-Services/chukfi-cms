import React, { useState } from "react";
import {
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

interface Collection {
  id: string;
  name: string;
  displayName: string;
  description: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
  status: "active" | "disabled";
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
  },
  {
    id: "6",
    name: "events",
    displayName: "Events",
    description: "Upcoming events and workshops",
    documentCount: 15,
    createdAt: "2024-03-15T14:30:00Z",
    updatedAt: "2024-11-21T10:10:00Z",
    status: "disabled",
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

export default function CollectionsList() {
  const [collections, setCollections] = useState<Collection[]>(mockCollections);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Collection>("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "disabled"
  >("all");

  // Filter and sort collections
  const filteredCollections = collections
    .filter((collection) => {
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

  const handleSort = (field: keyof Collection) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDeleteCollection = (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this collection? This action cannot be undone."
      )
    ) {
      setCollections(collections.filter((c) => c.id !== id));
    }
  };

  const handleDuplicateCollection = (collection: Collection) => {
    const newCollection: Collection = {
      ...collection,
      id: Date.now().toString(),
      name: `${collection.name}_copy`,
      displayName: `${collection.displayName} (Copy)`,
      documentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCollections([...collections, newCollection]);
  };

  return (
    <div className="p-6">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search collections
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
              id="search"
              name="search"
              type="search"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        {/* Results count */}
        <div className="flex items-center text-sm text-gray-500">
          {filteredCollections.length} of {collections.length} collections
        </div>
      </div>

      {/* Collections table */}
      <div className="mt-6 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 sm:pl-0"
                    onClick={() => handleSort("displayName")}
                  >
                    <div className="group inline-flex">
                      Collection
                      <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible">
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
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("documentCount")}
                  >
                    <div className="group inline-flex">
                      Documents
                      <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible">
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
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("status")}
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("updatedAt")}
                  >
                    <div className="group inline-flex">
                      Last Updated
                      <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible">
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
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCollections.map((collection) => (
                  <tr key={collection.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-0">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <svg
                              className="h-6 w-6 text-indigo-600"
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
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {collection.displayName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {collection.description}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            API:{" "}
                            <code className="bg-gray-100 px-1 rounded">
                              /api/v1/collections/{collection.name}
                            </code>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="font-medium">
                          {collection.documentCount}
                        </span>
                        <span className="ml-1 text-gray-500">items</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          collection.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {collection.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div>
                        <div title={formatDateTime(collection.updatedAt)}>
                          {formatDate(collection.updatedAt)}
                        </div>
                      </div>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <div className="flex items-center justify-end space-x-2">
                        {/* View/Manage button */}
                        <button
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                          title="Manage collection"
                        >
                          <ChevronRightIcon className="h-4 w-4" />
                        </button>

                        {/* Edit button */}
                        <button
                          className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-50"
                          title="Edit collection"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>

                        {/* Duplicate button */}
                        <button
                          onClick={() => handleDuplicateCollection(collection)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-50"
                          title="Duplicate collection"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteCollection(collection.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                          title="Delete collection"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
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
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No collections found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Get started by creating your first collection."}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
    </div>
  );
}
