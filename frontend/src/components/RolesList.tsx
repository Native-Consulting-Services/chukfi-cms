import { useState, useEffect } from "react";
import EditPermissionsModal from "./EditPermissionsModal";
import { usePermissions } from "../lib/usePermissions";

interface Role {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = "http://localhost:8080";

export default function RolesList() {
  const { canUpdate, canDelete } = usePermissions();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [editingPermissions, setEditingPermissions] = useState<Role | null>(
    null,
  );
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  useEffect(() => {
    fetchRoles();

    // Listen for refresh event from CreateRoleButton
    const handleRefresh = () => {
      fetchRoles();
    };

    window.addEventListener("refreshRoles", handleRefresh);
    return () => window.removeEventListener("refreshRoles", handleRefresh);
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("chukfi_auth_token");
      console.log("Fetching roles, token:", token ? "exists" : "missing");

      if (!token) {
        setError("Not authenticated");
        return;
      }

      console.log("Calling API:", `${API_URL}/api/v1/roles`);
      const response = await fetch(`${API_URL}/api/v1/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }

      const data = await response.json();
      console.log("Received data:", data);
      setRoles(data.roles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  // Filter roles based on search
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description &&
        role.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const handleSelectRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  const handleSelectAll = () => {
    setSelectedRoles(
      selectedRoles.length === filteredRoles.length
        ? []
        : filteredRoles.map((role) => role.id),
    );
  };

  const handleDeleteRole = async (role: Role) => {
    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/roles/${role.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete role");
      }

      setDeletingRole(null);
      fetchRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete role");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleIcon = (roleName: string) => {
    const lowerName = roleName.toLowerCase();

    // Super Admin - Crown
    if (lowerName.includes("super admin")) {
      return {
        bg: "bg-purple-100",
        color: "text-purple-600",
        path: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
      };
    }

    // Admin - Key
    if (lowerName.includes("admin")) {
      return {
        bg: "bg-red-100",
        color: "text-red-600",
        path: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
      };
    }

    // Editor - Pencil
    if (lowerName.includes("editor")) {
      return {
        bg: "bg-blue-100",
        color: "text-blue-600",
        path: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
      };
    }

    // Author - Document with pen
    if (lowerName.includes("author") || lowerName.includes("contributor")) {
      return {
        bg: "bg-green-100",
        color: "text-green-600",
        path: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      };
    }

    // Viewer - Eye
    if (lowerName.includes("viewer") || lowerName.includes("reader")) {
      return {
        bg: "bg-gray-100",
        color: "text-gray-600",
        path: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
      };
    }

    // Default - Shield
    return {
      bg: "bg-indigo-100",
      color: "text-indigo-600",
      path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    };
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Loading roles...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Error display */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400 dark:text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm text-red-800 dark:text-red-200">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="mb-6 sm:flex sm:items-center sm:space-x-4">
        <div className="min-w-0 flex-1">
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search roles..."
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:placeholder-gray-500 dark:focus:ring-indigo-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Roles table */}
      <div className="ring-opacity-5 dark:ring-opacity-10 overflow-hidden bg-white ring-1 shadow ring-black md:rounded-lg dark:bg-gray-800 dark:ring-white">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                <input
                  type="checkbox"
                  className="absolute top-1/2 left-4 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-indigo-500 dark:focus:ring-indigo-400"
                  checked={
                    selectedRoles.length === filteredRoles.length &&
                    filteredRoles.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th
                scope="col"
                className="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                Description
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                Created
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100"
              >
                Updated
              </th>
              <th scope="col" className="relative py-3.5 pr-4 pl-3 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {filteredRoles.length > 0 ? (
              filteredRoles.map((role) => (
                <tr
                  key={role.id}
                  className={
                    selectedRoles.includes(role.id)
                      ? "bg-gray-50 dark:bg-gray-700/50"
                      : undefined
                  }
                >
                  <td className="relative px-7 sm:w-12 sm:px-6">
                    <input
                      type="checkbox"
                      className="absolute top-1/2 left-4 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-indigo-500 dark:focus:ring-indigo-400"
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => handleSelectRole(role.id)}
                    />
                  </td>
                  <td className="py-4 pr-3 text-sm whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div
                          className={`h-10 w-10 rounded-lg ${getRoleIcon(role.name).bg} dark:bg-opacity-20 flex items-center justify-center`}
                        >
                          <svg
                            className={`h-5 w-5 ${getRoleIcon(role.name).color} dark:brightness-125`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={getRoleIcon(role.name).path}
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {role.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {role.description || "-"}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {formatDate(role.createdAt)}
                  </td>
                  <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {formatDate(role.updatedAt)}
                  </td>
                  <td className="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                    <div className="flex items-center justify-end space-x-2">
                      {canUpdate("roles") && (
                        <button
                          type="button"
                          onClick={() => setEditingPermissions(role)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="Edit permissions"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}
                      {canDelete("roles") && (
                        <button
                          type="button"
                          onClick={() => setDeletingRole(role)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete role"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-14 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    No roles found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm
                      ? "Try adjusting your search criteria."
                      : "Get started by creating roles."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Results summary */}
      {!loading && (
        <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          Showing <span className="font-medium">{filteredRoles.length}</span> of{" "}
          <span className="font-medium">{roles.length}</span> roles
        </div>
      )}

      {/* Edit Permissions Modal */}
      {editingPermissions && (
        <EditPermissionsModal
          role={editingPermissions}
          onClose={() => setEditingPermissions(null)}
          onSave={() => {
            setEditingPermissions(null);
            fetchRoles();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingRole && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 opacity-80 transition-opacity dark:bg-gray-900 dark:opacity-75"
              onClick={() => setDeletingRole(null)}
            ></div>

            <div className="relative z-50 inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-middle shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 dark:bg-gray-800">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10 dark:bg-red-900/20">
                  <svg
                    className="h-6 w-6 text-red-600 dark:text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                    Delete Role
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete the role{" "}
                      <strong className="text-gray-900 dark:text-gray-100">
                        {deletingRole.name}
                      </strong>
                      ? This action cannot be undone and will remove all
                      associated permissions.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleDeleteRole(deletingRole)}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-500 dark:focus:ring-offset-gray-800"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingRole(null)}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
