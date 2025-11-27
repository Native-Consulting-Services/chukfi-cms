// Permission utility functions for checking user permissions

export interface Permission {
  collection: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface UserPermissions {
  [collection: string]: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}

/**
 * Parse user permissions from localStorage
 */
export function getUserPermissions(): UserPermissions {
  try {
    const userData = localStorage.getItem("chukfi_user");
    if (!userData) return {};

    const user = JSON.parse(userData);
    if (!user.roles || user.roles.length === 0) return {};

    const role = user.roles[0];
    if (!role.permissions || role.permissions.length === 0) return {};

    // Convert permission array to easy-to-use object
    const permissions: UserPermissions = {};
    role.permissions.forEach((perm: Permission) => {
      permissions[perm.collection] = {
        create: perm.canCreate,
        read: perm.canRead,
        update: perm.canUpdate,
        delete: perm.canDelete,
      };
    });

    return permissions;
  } catch (error) {
    console.error("Failed to parse user permissions:", error);
    return {};
  }
}

/**
 * Check if user is Super Admin (bypasses all permission checks)
 */
export function isSuperAdmin(): boolean {
  try {
    const userData = localStorage.getItem("chukfi_user");
    if (!userData) return false;

    const user = JSON.parse(userData);
    if (!user.roles || user.roles.length === 0) return false;

    return user.roles.some(
      (role: any) => role.name.toLowerCase() === "super admin"
    );
  } catch (error) {
    console.error("Failed to check super admin status:", error);
    return false;
  }
}

/**
 * Check if user has a specific permission for a collection
 */
export function hasPermission(
  collection: string,
  action: "create" | "read" | "update" | "delete"
): boolean {
  // Super Admin has all permissions
  if (isSuperAdmin()) return true;

  const permissions = getUserPermissions();
  return permissions[collection]?.[action] || false;
}

/**
 * Check if user can access a collection (has read permission)
 */
export function canAccess(collection: string): boolean {
  return hasPermission(collection, "read");
}

/**
 * Check if user can create items in a collection
 */
export function canCreate(collection: string): boolean {
  return hasPermission(collection, "create");
}

/**
 * Check if user can update items in a collection
 */
export function canUpdate(collection: string): boolean {
  return hasPermission(collection, "update");
}

/**
 * Check if user can delete items from a collection
 */
export function canDelete(collection: string): boolean {
  return hasPermission(collection, "delete");
}

/**
 * Get all collections the user has access to
 */
export function getAccessibleCollections(): string[] {
  if (isSuperAdmin()) {
    return ["users", "roles", "collections", "documents", "media", "profile"];
  }

  const permissions = getUserPermissions();
  return Object.keys(permissions).filter(
    (collection) => permissions[collection].read
  );
}
