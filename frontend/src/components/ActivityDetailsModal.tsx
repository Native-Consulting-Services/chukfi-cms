import { useEffect } from "react";
import type { ActivityLog } from "../types/activity";

interface ActivityDetailsModalProps {
  activity: ActivityLog;
  onClose: () => void;
}

const ActivityDetailsModal = ({
  activity,
  onClose,
}: ActivityDetailsModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900";
      case "updated":
        return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900";
      case "deleted":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Activity Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              {activity.userAvatar ? (
                <img
                  src={activity.userAvatar}
                  alt={activity.userName || "User"}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-600 dark:text-gray-300">
                    {activity.userName?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {activity.userName || "Unknown user"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  User ID: {activity.userId}
                </p>
              </div>
            </div>

            {/* Action */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Action
              </label>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getActionColor(activity.action)}`}
              >
                {activity.action}
              </span>
            </div>

            {/* Entity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Entity Type
                </label>
                <p className="text-sm text-gray-900 dark:text-white capitalize">
                  {activity.entityType}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Entity ID
                </label>
                <p className="text-sm text-gray-900 dark:text-white font-mono">
                  {activity.entityId || "N/A"}
                </p>
              </div>
            </div>

            {/* Entity Name */}
            {activity.entityName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Entity Name
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {activity.entityName}
                </p>
              </div>
            )}

            {/* Timestamp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timestamp
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatDateTime(activity.createdAt)}
              </p>
            </div>

            {/* Metadata */}
            {activity.metadata && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Metadata
                </label>
                <pre className="text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(JSON.parse(activity.metadata), null, 2)}
                </pre>
              </div>
            )}

            {/* IP Address */}
            {activity.ipAddress && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  IP Address
                </label>
                <p className="text-sm text-gray-900 dark:text-white font-mono">
                  {activity.ipAddress}
                </p>
              </div>
            )}

            {/* User Agent */}
            {activity.userAgent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User Agent
                </label>
                <p className="text-xs text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 p-3 rounded-lg break-all">
                  {activity.userAgent}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetailsModal;
