import { useState, useEffect } from "react";
import AddUserButton from "./AddUserButton";
import { usePermissions } from "../lib/usePermissions";

interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  roles?: Role[];
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

const API_URL = "http://localhost:8080";

export default function UsersList() {
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole] = useState("all");
  const [filterStatus] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch users and roles from API
  useEffect(() => {
    fetchUsers();
    fetchRoles();

    // Listen for refresh event from AddUserButton
    const handleRefresh = () => {
      fetchUsers();
    };

    window.addEventListener("refreshUsers", handleRefresh);
    return () => window.removeEventListener("refreshUsers", handleRefresh);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("chukfi_auth_token");
      console.log("Fetching users, token:", token ? "exists" : "missing");

      if (!token) {
        setError("Not authenticated");
        return;
      }

      console.log("Calling API:", `${API_URL}/api/v1/users`);
      const response = await fetch(`${API_URL}/api/v1/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      console.log("Received data:", data);
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) return;

      const response = await fetch(`${API_URL}/api/v1/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableRoles(data.roles || []);
      }
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setSelectedRoleId(
      user.roles && user.roles.length > 0 ? user.roles[0].id : "",
    );
    setShowEditModal(true);
    setFormError("");
  };

  const handleUpdateUserRole = async () => {
    if (!editingUser) return;

    setFormError("");
    setFormLoading(true);

    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      // Update user role
      const response = await fetch(
        `${API_URL}/api/v1/users/${editingUser.id}/roles`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roleId: selectedRoleId || null,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update user role");
      }

      // Close modal and refresh
      setShowEditModal(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to update role",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_URL}/api/v1/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Refresh user list
      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const getRoleBadge = (roles: Role[] = []) => {
    if (roles.length === 0)
      return (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          No roles
        </span>
      );

    const role = roles[0];
    const lowerName = role.name.toLowerCase();

    let badgeClass =
      "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";

    // Match the colors from RolesList
    if (lowerName.includes("super admin")) {
      badgeClass =
        "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300";
    } else if (lowerName.includes("admin")) {
      badgeClass = "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300";
    } else if (lowerName.includes("editor")) {
      badgeClass =
        "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300";
    } else if (
      lowerName.includes("author") ||
      lowerName.includes("contributor")
    ) {
      badgeClass =
        "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300";
    } else if (lowerName.includes("viewer") || lowerName.includes("reader")) {
      badgeClass =
        "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
      >
        {role.name}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

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
            <p className="ml-3 text-sm text-red-800 dark:text-red-300">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Search and Actions Header */}
      <div className="mb-6 sm:flex sm:items-center sm:justify-between">
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
              placeholder="Search users..."
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {mounted && canCreate("users") && (
          <div className="mt-4 sm:mt-0 sm:ml-4">
            <AddUserButton />
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center">
          <svg
            className="mx-auto h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Loading users...
          </p>
        </div>
      )}

      {/* Users table */}
      {!loading && (
        <div className="ring-opacity-5 overflow-hidden bg-white ring-1 shadow ring-black md:rounded-lg dark:bg-gray-800 dark:ring-gray-700">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                  <input
                    type="checkbox"
                    className="absolute top-1/2 left-4 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                    checked={
                      selectedUsers.length === filteredUsers.length &&
                      filteredUsers.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th
                  scope="col"
                  className="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Created
                </th>
                <th scope="col" className="relative py-3.5 pr-4 pl-3 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="py-4 pr-3 pl-4 text-sm whitespace-nowrap sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                            <svg
                              className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {user.displayName}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {getRoleBadge(user.roles)}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                      <div className="flex items-center justify-end space-x-2">
                        {mounted && canUpdate("users") && (
                          <button
                            type="button"
                            onClick={() => handleEditUser(user)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            title="Edit user"
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
                        {mounted && canDelete("users") && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete user"
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
                    colSpan={4}
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No users found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm ||
                      filterRole !== "all" ||
                      filterStatus !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "Get started by inviting team members."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Results summary */}
      {!loading && (
        <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          Showing <span className="font-medium">{filteredUsers.length}</span> of{" "}
          <span className="font-medium">{users.length}</span> users
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 opacity-80 transition-opacity dark:bg-gray-900"
              onClick={() => setShowEditModal(false)}
            ></div>

            <div className="relative z-50 inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-middle shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 dark:bg-gray-800">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Edit User Role
                  </h3>
                  <div className="mt-4">
                    <div className="mb-4 rounded-md bg-gray-50 p-4 dark:bg-gray-900">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {editingUser.displayName}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {editingUser.email}
                        </div>
                      </div>
                    </div>

                    {formError && (
                      <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                        <p className="text-sm text-red-800 dark:text-red-300">
                          {formError}
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="role"
                          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Role
                        </label>
                        <select
                          id="role"
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          value={selectedRoleId}
                          onChange={(e) => setSelectedRoleId(e.target.value)}
                        >
                          <option value="">No role assigned</option>
                          {availableRoles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                              {role.description && ` - ${role.description}`}
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Only one role can be assigned per user.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <button
                        type="button"
                        disabled={formLoading}
                        onClick={handleUpdateUserRole}
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:col-start-2 sm:text-sm dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-800"
                      >
                        {formLoading ? "Updating..." : "Update Role"}
                      </button>
                      <button
                        type="button"
                        disabled={formLoading}
                        onClick={() => {
                          setShowEditModal(false);
                          setEditingUser(null);
                        }}
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:col-start-1 sm:mt-0 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
