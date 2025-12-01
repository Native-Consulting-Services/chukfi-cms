import { useState, useEffect } from "react";
import type { ActivityLog } from "../types/activity";
import ActivityDetailsModal from "./ActivityDetailsModal";

const ActivityPage = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    if (typeof window === "undefined") return;

    try {
      setLoading(true);

      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        "http://localhost:8080/api/v1/activity?limit=1000",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }

      const data = await response.json();
      setActivities(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "text-green-600 dark:text-green-400";
      case "updated":
        return "text-blue-600 dark:text-blue-400";
      case "deleted":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">
          Loading activities...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Activity Log
        </h1>
        <button
          onClick={fetchActivities}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {/* Activity List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No activity logs found
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {activities.map((activity) => (
              <div
                key={activity.id}
                onClick={() => setSelectedActivity(activity)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* User Avatar */}
                  {activity.userAvatar ? (
                    <img
                      src={activity.userAvatar}
                      alt={activity.userName || "User"}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {activity.userName?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                  )}

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {activity.userName || "Unknown user"}
                      </span>
                      <span
                        className={`font-medium ${getActionColor(activity.action)}`}
                      >
                        {activity.action}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {activity.entityType}
                      </span>
                      {activity.entityName && (
                        <span className="text-gray-900 dark:text-white font-medium">
                          "{activity.entityName}"
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatDateTime(activity.createdAt)}
                    </div>
                  </div>

                  {/* Chevron */}
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <ActivityDetailsModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>
  );
};

export default ActivityPage;
