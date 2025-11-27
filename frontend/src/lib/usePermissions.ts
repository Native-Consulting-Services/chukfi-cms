import { useState, useEffect } from "react";
import {
  getUserPermissions,
  isSuperAdmin,
  hasPermission,
  canAccess,
  canCreate,
  canUpdate,
  canDelete,
  getAccessibleCollections,
  type UserPermissions,
} from "./permissions";

/**
 * React hook for checking permissions in components
 * Automatically updates when user data changes
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [isSuper, setIsSuper] = useState(false);
  const [accessibleCollections, setAccessibleCollections] = useState<string[]>(
    []
  );

  useEffect(() => {
    loadPermissions();

    // Listen for user login/logout events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "chukfi_user" || e.key === "chukfi_auth_token") {
        loadPermissions();
      }
    };

    // Listen for custom refresh events
    const handleRefresh = () => {
      loadPermissions();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("refreshUser", handleRefresh);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("refreshUser", handleRefresh);
    };
  }, []);

  const loadPermissions = () => {
    setPermissions(getUserPermissions());
    setIsSuper(isSuperAdmin());
    setAccessibleCollections(getAccessibleCollections());
  };

  return {
    permissions,
    isSuperAdmin: isSuper,
    accessibleCollections,
    hasPermission: (
      collection: string,
      action: "create" | "read" | "update" | "delete"
    ) => hasPermission(collection, action),
    canAccess: (collection: string) => canAccess(collection),
    canCreate: (collection: string) => canCreate(collection),
    canUpdate: (collection: string) => canUpdate(collection),
    canDelete: (collection: string) => canDelete(collection),
  };
}
