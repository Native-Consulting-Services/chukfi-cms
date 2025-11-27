import React, { useState, useEffect } from "react";

interface MediaStatsProps {
  total: number;
  images: number;
  documents: number;
  storageUsed: number;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function MediaStats({
  total: initialTotal,
  images: initialImages,
  documents: initialDocuments,
  storageUsed: initialStorageUsed,
}: MediaStatsProps) {
  const [stats, setStats] = useState({
    total: initialTotal,
    images: initialImages,
    documents: initialDocuments,
    storageUsed: initialStorageUsed,
  });

  useEffect(() => {
    const handleStatsUpdate = (event: CustomEvent) => {
      setStats(event.detail);
    };

    window.addEventListener(
      "mediaStatsUpdate",
      handleStatsUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "mediaStatsUpdate",
        handleStatsUpdate as EventListener
      );
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Files */}
      <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
        <div>
          <div className="absolute">
            <div className="rounded-md bg-indigo-500 p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
          </div>
          <p className="ml-16 truncate text-sm font-medium text-gray-500">
            Total Files
          </p>
          <p className="ml-16 text-2xl font-semibold text-gray-900">
            {stats.total}
          </p>
        </div>
      </div>

      {/* Images */}
      <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
        <div>
          <div className="absolute">
            <div className="rounded-md bg-green-500 p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
          </div>
          <p className="ml-16 truncate text-sm font-medium text-gray-500">
            Images
          </p>
          <p className="ml-16 text-2xl font-semibold text-gray-900">
            {stats.images}
          </p>
        </div>
      </div>

      {/* Documents */}
      <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
        <div>
          <div className="absolute">
            <div className="rounded-md bg-yellow-500 p-3">
              <svg
                className="h-6 w-6 text-white"
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
            </div>
          </div>
          <p className="ml-16 truncate text-sm font-medium text-gray-500">
            Documents
          </p>
          <p className="ml-16 text-2xl font-semibold text-gray-900">
            {stats.documents}
          </p>
        </div>
      </div>

      {/* Storage Used */}
      <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
        <div>
          <div className="absolute">
            <div className="rounded-md bg-purple-500 p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                ></path>
              </svg>
            </div>
          </div>
          <p className="ml-16 truncate text-sm font-medium text-gray-500">
            Storage Used
          </p>
          <p className="ml-16 text-2xl font-semibold text-gray-900">
            {formatFileSize(stats.storageUsed)}
          </p>
        </div>
      </div>
    </div>
  );
}
