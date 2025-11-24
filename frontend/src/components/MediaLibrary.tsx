import React, { useState } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TrashIcon,
  PencilIcon,
  DocumentIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

interface MediaFile {
  id: string;
  name: string;
  type: "image" | "document" | "video" | "audio";
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  tags: string[];
  alt?: string;
  width?: number;
  height?: number;
}

// Mock data - replace with actual API call
const mockMediaFiles: MediaFile[] = [
  {
    id: "1",
    name: "hero-banner.jpg",
    type: "image",
    mimeType: "image/jpeg",
    size: 2458240,
    url: "/media/hero-banner.jpg",
    thumbnailUrl: "/media/thumbs/hero-banner.jpg",
    uploadedAt: "2024-11-20T10:30:00Z",
    uploadedBy: "John Doe",
    tags: ["banner", "homepage"],
    alt: "Hero banner for homepage",
    width: 1920,
    height: 1080,
  },
  {
    id: "2",
    name: "product-catalog.pdf",
    type: "document",
    mimeType: "application/pdf",
    size: 5242880,
    url: "/media/product-catalog.pdf",
    uploadedAt: "2024-11-19T14:22:00Z",
    uploadedBy: "Jane Smith",
    tags: ["catalog", "products"],
  },
  {
    id: "3",
    name: "team-photo.jpg",
    type: "image",
    mimeType: "image/jpeg",
    size: 3145728,
    url: "/media/team-photo.jpg",
    thumbnailUrl: "/media/thumbs/team-photo.jpg",
    uploadedAt: "2024-11-18T16:45:00Z",
    uploadedBy: "Mike Johnson",
    tags: ["team", "about"],
    alt: "Company team photo",
    width: 1600,
    height: 1200,
  },
  {
    id: "4",
    name: "logo-variations.zip",
    type: "document",
    mimeType: "application/zip",
    size: 1048576,
    url: "/media/logo-variations.zip",
    uploadedAt: "2024-11-17T11:20:00Z",
    uploadedBy: "Sarah Wilson",
    tags: ["branding", "logos"],
  },
  {
    id: "5",
    name: "product-demo.mp4",
    type: "video",
    mimeType: "video/mp4",
    size: 15728640,
    url: "/media/product-demo.mp4",
    thumbnailUrl: "/media/thumbs/product-demo.jpg",
    uploadedAt: "2024-11-16T09:15:00Z",
    uploadedBy: "John Doe",
    tags: ["demo", "product"],
  },
  {
    id: "6",
    name: "testimonial-bg.png",
    type: "image",
    mimeType: "image/png",
    size: 987654,
    url: "/media/testimonial-bg.png",
    thumbnailUrl: "/media/thumbs/testimonial-bg.png",
    uploadedAt: "2024-11-15T13:30:00Z",
    uploadedBy: "Jane Smith",
    tags: ["background", "testimonials"],
    alt: "Testimonial section background",
    width: 1200,
    height: 800,
  },
  {
    id: "7",
    name: "user-manual.docx",
    type: "document",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 2097152,
    url: "/media/user-manual.docx",
    uploadedAt: "2024-11-14T10:45:00Z",
    uploadedBy: "Mike Johnson",
    tags: ["documentation", "manual"],
  },
  {
    id: "8",
    name: "feature-icons.svg",
    type: "image",
    mimeType: "image/svg+xml",
    size: 65536,
    url: "/media/feature-icons.svg",
    uploadedAt: "2024-11-13T15:20:00Z",
    uploadedBy: "Sarah Wilson",
    tags: ["icons", "ui"],
    alt: "Feature section icons",
  },
];

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getFileIcon = (type: string, mimeType: string) => {
  if (type === "image") {
    return <PhotoIcon className="h-8 w-8 text-green-500" />;
  } else if (type === "video") {
    return (
      <div className="h-8 w-8 text-purple-500">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    );
  } else if (mimeType.includes("pdf")) {
    return <DocumentIcon className="h-8 w-8 text-red-500" />;
  } else {
    return <DocumentIcon className="h-8 w-8 text-blue-500" />;
  }
};

type ViewMode = "grid" | "list";
type FilterType = "all" | "image" | "document" | "video" | "audio";

export default function MediaLibrary() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(mockMediaFiles);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortField, setSortField] = useState<keyof MediaFile>("uploadedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Filter and sort media files
  const filteredFiles = mediaFiles
    .filter((file) => {
      const matchesSearch =
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesType = filterType === "all" || file.type === filterType;
      return matchesSearch && matchesType;
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

  const handleSelectFile = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map((f) => f.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (
      selectedFiles.size > 0 &&
      confirm(`Delete ${selectedFiles.size} selected file(s)?`)
    ) {
      setMediaFiles(mediaFiles.filter((f) => !selectedFiles.has(f.id)));
      setSelectedFiles(new Set());
    }
  };

  const handleDeleteFile = (fileId: string) => {
    const file = mediaFiles.find((f) => f.id === fileId);
    if (file && confirm(`Delete "${file.name}"?`)) {
      setMediaFiles(mediaFiles.filter((f) => f.id !== fileId));
    }
  };

  return (
    <div className="p-6">
      {/* Header and controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* File type filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="all">All Files</option>
            <option value="image">Images</option>
            <option value="document">Documents</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split("-");
              setSortField(field as keyof MediaFile);
              setSortDirection(direction as "asc" | "desc");
            }}
            className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            <option value="uploadedAt-desc">Newest First</option>
            <option value="uploadedAt-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-desc">Largest First</option>
            <option value="size-asc">Smallest First</option>
          </select>

          {/* View mode toggle */}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-sm font-medium ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 ${
                viewMode === "grid"
                  ? "bg-indigo-600 text-white ring-indigo-600"
                  : "bg-white text-gray-900"
              }`}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`relative -ml-px inline-flex items-center rounded-r-md px-2 py-2 text-sm font-medium ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white ring-indigo-600"
                  : "bg-white text-gray-900"
              }`}
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedFiles.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-md bg-blue-50 px-4 py-2">
          <span className="text-sm text-blue-800">
            {selectedFiles.size} file{selectedFiles.size > 1 ? "s" : ""}{" "}
            selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteSelected}
              className="inline-flex items-center rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-red-500"
            >
              <TrashIcon className="mr-1 h-3 w-3" />
              Delete
            </button>
            <button
              onClick={() => setSelectedFiles(new Set())}
              className="inline-flex items-center rounded-md bg-gray-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Media grid/list */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`group relative rounded-lg border p-3 hover:shadow-md transition-all duration-200 ${
                selectedFiles.has(file.id)
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-300 bg-white"
              }`}
            >
              {/* Selection checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.id)}
                  onChange={() => handleSelectFile(file.id)}
                  className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-600"
                />
              </div>

              {/* File preview */}
              <div className="aspect-square mb-3 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                {file.thumbnailUrl ? (
                  <img
                    src={file.thumbnailUrl}
                    alt={file.alt || file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getFileIcon(file.type, file.mimeType)
                )}
              </div>

              {/* File info */}
              <div>
                <h4
                  className="text-sm font-medium text-gray-900 truncate"
                  title={file.name}
                >
                  {file.name}
                </h4>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
                {file.width && file.height && (
                  <p className="text-xs text-gray-400">
                    {file.width} × {file.height}
                  </p>
                )}
              </div>

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-2">
                <button
                  className="rounded-full bg-white p-1.5 text-gray-700 hover:text-indigo-600"
                  title="View"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  className="rounded-full bg-white p-1.5 text-gray-700 hover:text-indigo-600"
                  title="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  className="rounded-full bg-white p-1.5 text-gray-700 hover:text-green-600"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  className="rounded-full bg-white p-1.5 text-gray-700 hover:text-red-600"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                  <input
                    type="checkbox"
                    checked={
                      filteredFiles.length > 0 &&
                      selectedFiles.size === filteredFiles.length
                    }
                    onChange={handleSelectAll}
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                </th>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
                >
                  File
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Size
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Uploaded
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  By
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredFiles.map((file) => (
                <tr
                  key={file.id}
                  className={selectedFiles.has(file.id) ? "bg-indigo-50" : ""}
                >
                  <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={() => handleSelectFile(file.id)}
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </td>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {file.thumbnailUrl ? (
                          <img
                            src={file.thumbnailUrl}
                            alt={file.alt || file.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center">
                            {getFileIcon(file.type, file.mimeType)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          {file.name}
                        </div>
                        {file.width && file.height && (
                          <div className="text-gray-500 text-sm">
                            {file.width} × {file.height}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                      {file.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatDate(file.uploadedAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {file.uploadedBy}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
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
      )}

      {/* Empty state */}
      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No files found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Get started by uploading your first file."}
          </p>
          {!searchTerm && filterType === "all" && (
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                <PhotoIcon className="mr-2 h-4 w-4" />
                Upload Files
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results info */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <div>
          Showing {filteredFiles.length} of {mediaFiles.length} files
        </div>
        <div>
          Total storage:{" "}
          {formatFileSize(
            mediaFiles.reduce((total, file) => total + file.size, 0)
          )}
        </div>
      </div>
    </div>
  );
}
