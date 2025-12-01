/**
 * Utility for logging user activities to the backend API
 */

interface LogActivityParams {
  action: "created" | "updated" | "deleted" | "viewed" | "login" | "logout";
  entityType: string;
  entityId?: string;
  entityName?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an activity to the backend API
 */
export async function logActivity({
  action,
  entityType,
  entityId,
  entityName,
  metadata,
}: LogActivityParams): Promise<void> {
  try {
    // Only run in browser
    if (typeof window === "undefined") {
      return;
    }

    const token = localStorage.getItem("chukfi_auth_token");
    if (!token) {
      console.warn("Cannot log activity: No auth token");
      return;
    }

    console.log("Logging activity:", {
      action,
      entityType,
      entityId,
      entityName,
    });

    const response = await fetch("http://localhost:8080/api/v1/activity", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        entityType,
        entityId,
        entityName,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to log activity:", response.status, errorText);
    } else {
      console.log("Activity logged successfully");
    }
  } catch (error) {
    // Don't throw - activity logging should not break the main flow
    console.error("Error logging activity:", error);
  }
}
