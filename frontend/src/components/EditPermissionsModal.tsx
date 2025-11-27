import { useState, useEffect } from "react";

interface Permission {
  id?: string;
  collection: string;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

interface EditPermissionsModalProps {
  role: Role;
  onClose: () => void;
  onSave: () => void;
}

const API_URL = "http://localhost:8080";

// Available collections/sections in the CMS
const COLLECTIONS = [
  { name: "users", label: "Users", description: "Manage user accounts" },
  {
    name: "roles",
    label: "Roles",
    description: "Manage roles and permissions",
  },
  {
    name: "collections",
    label: "Collections",
    description: "Manage content collections",
  },
  {
    name: "documents",
    label: "Documents",
    description: "Manage content documents",
  },
  { name: "media", label: "Media", description: "Manage media files" },
  { name: "profile", label: "Profile", description: "User profile settings" },
];

export default function EditPermissionsModal({
  role,
  onClose,
  onSave,
}: EditPermissionsModalProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPermissions();
  }, [role.id]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) return;

      const response = await fetch(
        `${API_URL}/api/v1/roles/${role.id}/permissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const existingPermissions = data.permissions || [];

        // Initialize permissions for all collections
        const allPermissions = COLLECTIONS.map((collection) => {
          const existing = existingPermissions.find(
            (p: Permission) => p.collection === collection.name
          );
          return (
            existing || {
              collection: collection.name,
              canCreate: false,
              canRead: false,
              canUpdate: false,
              canDelete: false,
            }
          );
        });

        setPermissions(allPermissions);
      }
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
      setError("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (
    collection: string,
    field: keyof Omit<Permission, "id" | "collection">,
    value: boolean
  ) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.collection === collection ? { ...p, [field]: value } : p
      )
    );
  };

  const handleSelectAll = (collection: string) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.collection === collection
          ? {
              ...p,
              canCreate: true,
              canRead: true,
              canUpdate: true,
              canDelete: true,
            }
          : p
      )
    );
  };

  const handleDeselectAll = (collection: string) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.collection === collection
          ? {
              ...p,
              canCreate: false,
              canRead: false,
              canUpdate: false,
              canDelete: false,
            }
          : p
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${API_URL}/api/v1/roles/${role.id}/permissions`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ permissions }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update permissions");
      }

      onSave();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save permissions"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 opacity-80 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative inline-block align-middle bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full sm:p-6 z-50">
          <div>
            <div className="sm:flex sm:items-start">
              <div className="w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                  Edit Permissions: {role.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{role.description}</p>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      Loading permissions...
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Collection
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Create
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Read
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Update
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Delete
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {permissions.map((permission, index) => {
                          const collectionInfo = COLLECTIONS.find(
                            (c) => c.name === permission.collection
                          );
                          const allSelected =
                            permission.canCreate &&
                            permission.canRead &&
                            permission.canUpdate &&
                            permission.canDelete;

                          return (
                            <tr
                              key={permission.collection}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="px-4 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {collectionInfo?.label ||
                                    permission.collection}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {collectionInfo?.description}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={permission.canCreate}
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      permission.collection,
                                      "canCreate",
                                      e.target.checked
                                    )
                                  }
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-4 py-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={permission.canRead}
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      permission.collection,
                                      "canRead",
                                      e.target.checked
                                    )
                                  }
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-4 py-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={permission.canUpdate}
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      permission.collection,
                                      "canUpdate",
                                      e.target.checked
                                    )
                                  }
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-4 py-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={permission.canDelete}
                                  onChange={(e) =>
                                    handlePermissionChange(
                                      permission.collection,
                                      "canDelete",
                                      e.target.checked
                                    )
                                  }
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-4 py-4 text-center">
                                {allSelected ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeselectAll(permission.collection)
                                    }
                                    className="text-xs text-red-600 hover:text-red-900"
                                  >
                                    Clear All
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSelectAll(permission.collection)
                                    }
                                    className="text-xs text-indigo-600 hover:text-indigo-900"
                                  >
                                    Select All
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              type="button"
              disabled={saving || loading}
              onClick={handleSave}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Permissions"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
