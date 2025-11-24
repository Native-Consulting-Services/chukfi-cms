import React, { useState } from "react";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  type: "system" | "custom";
  userCount: number;
  permissions: string[];
  color: string;
  createdAt: string;
  updatedAt: string;
}

export default function RolesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [showPermissions, setShowPermissions] = useState<number | null>(null);

  // Mock permissions data
  const permissions: Permission[] = [
    {
      id: "read_content",
      name: "Read Content",
      description: "View published content",
      category: "Content",
    },
    {
      id: "create_content",
      name: "Create Content",
      description: "Create new content items",
      category: "Content",
    },
    {
      id: "edit_content",
      name: "Edit Content",
      description: "Edit existing content",
      category: "Content",
    },
    {
      id: "delete_content",
      name: "Delete Content",
      description: "Delete content items",
      category: "Content",
    },
    {
      id: "publish_content",
      name: "Publish Content",
      description: "Publish and unpublish content",
      category: "Content",
    },
    {
      id: "edit_own_content",
      name: "Edit Own Content",
      description: "Edit only own content items",
      category: "Content",
    },
    {
      id: "upload_media",
      name: "Upload Media",
      description: "Upload files to media library",
      category: "Media",
    },
    {
      id: "manage_media",
      name: "Manage Media",
      description: "Full media library management",
      category: "Media",
    },
    {
      id: "view_users",
      name: "View Users",
      description: "View user listings",
      category: "Users",
    },
    {
      id: "create_users",
      name: "Create Users",
      description: "Invite and create new users",
      category: "Users",
    },
    {
      id: "edit_users",
      name: "Edit Users",
      description: "Edit user details and roles",
      category: "Users",
    },
    {
      id: "delete_users",
      name: "Delete Users",
      description: "Delete user accounts",
      category: "Users",
    },
    {
      id: "manage_roles",
      name: "Manage Roles",
      description: "Create and edit roles",
      category: "System",
    },
    {
      id: "manage_settings",
      name: "Manage Settings",
      description: "Access system settings",
      category: "System",
    },
    {
      id: "view_analytics",
      name: "View Analytics",
      description: "Access analytics and reports",
      category: "Analytics",
    },
    {
      id: "full_access",
      name: "Full Access",
      description: "Complete system access",
      category: "System",
    },
  ];

  // Mock roles data
  const roles: Role[] = [
    {
      id: 1,
      name: "Super Admin",
      description: "Complete system access with all permissions",
      type: "system",
      userCount: 2,
      permissions: ["full_access"],
      color: "purple",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: 2,
      name: "Admin",
      description: "Administrative access with most permissions",
      type: "system",
      userCount: 3,
      permissions: [
        "create_content",
        "edit_content",
        "delete_content",
        "publish_content",
        "manage_media",
        "view_users",
        "create_users",
        "edit_users",
        "manage_settings",
      ],
      color: "red",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-15",
    },
    {
      id: 3,
      name: "Editor",
      description: "Content management and publishing permissions",
      type: "system",
      userCount: 5,
      permissions: [
        "read_content",
        "create_content",
        "edit_content",
        "publish_content",
        "upload_media",
        "manage_media",
      ],
      color: "blue",
      createdAt: "2024-01-01",
      updatedAt: "2024-02-01",
    },
    {
      id: 4,
      name: "Author",
      description: "Create and edit own content",
      type: "system",
      userCount: 8,
      permissions: [
        "read_content",
        "create_content",
        "edit_own_content",
        "upload_media",
      ],
      color: "indigo",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-20",
    },
    {
      id: 5,
      name: "Content Moderator",
      description: "Review and moderate user-generated content",
      type: "custom",
      userCount: 3,
      permissions: [
        "read_content",
        "edit_content",
        "delete_content",
        "view_users",
      ],
      color: "green",
      createdAt: "2024-02-15",
      updatedAt: "2024-03-01",
    },
    {
      id: 6,
      name: "Viewer",
      description: "Read-only access to content",
      type: "system",
      userCount: 12,
      permissions: ["read_content"],
      color: "gray",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ];

  // Filter roles based on search and type
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || role.type === filterType;

    return matchesSearch && matchesType;
  });

  const handleSelectRole = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSelectAll = () => {
    setSelectedRoles(
      selectedRoles.length === filteredRoles.length
        ? []
        : filteredRoles.map((role) => role.id)
    );
  };

  const getTypeBadge = (type: string) => {
    const typeClasses = {
      system: "bg-green-100 text-green-800",
      custom: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeClasses[type as keyof typeof typeClasses]}`}
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role: Role) => {
    const colorClasses = {
      purple: "bg-purple-100 text-purple-800",
      red: "bg-red-100 text-red-800",
      blue: "bg-blue-100 text-blue-800",
      indigo: "bg-indigo-100 text-indigo-800",
      green: "bg-green-100 text-green-800",
      gray: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[role.color as keyof typeof colorClasses]}`}
      >
        {role.name}
      </span>
    );
  };

  const getPermissionsByCategory = (permissionIds: string[]) => {
    const rolePermissions = permissions.filter((p) =>
      permissionIds.includes(p.id)
    );
    const grouped = rolePermissions.reduce(
      (acc, perm) => {
        if (!acc[perm.category]) acc[perm.category] = [];
        acc[perm.category].push(perm);
        return acc;
      },
      {} as Record<string, Permission[]>
    );
    return grouped;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Search and filters */}
      <div className="sm:flex sm:items-center sm:space-x-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-3 sm:mt-0">
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="system">System Roles</option>
            <option value="custom">Custom Roles</option>
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedRoles.length > 0 && (
        <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-indigo-700 font-medium">
                {selectedRoles.length} role{selectedRoles.length > 1 ? "s" : ""}{" "}
                selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-indigo-300 text-xs font-medium rounded text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Duplicate
              </button>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roles table */}
      <div className="bg-white overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={
                    selectedRoles.length === filteredRoles.length &&
                    filteredRoles.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th
                scope="col"
                className="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
              >
                Role
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
                Users
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Permissions
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Updated
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredRoles.length > 0 ? (
              filteredRoles.map((role) => (
                <React.Fragment key={role.id}>
                  <tr
                    className={
                      selectedRoles.includes(role.id) ? "bg-gray-50" : undefined
                    }
                  >
                    <td className="relative px-7 sm:w-12 sm:px-6">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedRoles.includes(role.id)}
                        onChange={() => handleSelectRole(role.id)}
                      />
                    </td>
                    <td className="whitespace-nowrap py-4 pr-3 text-sm">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <svg
                              className="h-5 w-5 text-gray-400"
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
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <div className="font-medium text-gray-900">
                              {role.name}
                            </div>
                            {getRoleBadge(role)}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {role.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {getTypeBadge(role.type)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="font-medium">{role.userCount}</span>{" "}
                      users
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <button
                        type="button"
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                        onClick={() =>
                          setShowPermissions(
                            showPermissions === role.id ? null : role.id
                          )
                        }
                      >
                        {role.permissions.length} permission
                        {role.permissions.length !== 1 ? "s" : ""}
                        <svg
                          className={`ml-1 h-4 w-4 inline transform transition-transform ${showPermissions === role.id ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(role.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          type="button"
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit role"
                        >
                          <svg
                            className="h-4 w-4"
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
                        <button
                          type="button"
                          className="text-green-600 hover:text-green-900"
                          title="Duplicate role"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                        {role.type === "custom" && (
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-900"
                            title="Delete role"
                          >
                            <svg
                              className="h-4 w-4"
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
                  {/* Permissions dropdown */}
                  {showPermissions === role.id && (
                    <tr>
                      <td colSpan={7} className="px-7 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-900">
                            Permissions for {role.name}
                          </h4>
                          {Object.entries(
                            getPermissionsByCategory(role.permissions)
                          ).map(([category, perms]) => (
                            <div key={category} className="space-y-2">
                              <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                                {category}
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {perms.map((perm) => (
                                  <span
                                    key={perm.id}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                  >
                                    {perm.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-14 text-center text-sm text-gray-500"
                >
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
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
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No roles found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || filterType !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "Get started by creating custom roles."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Results summary */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredRoles.length}</span> of{" "}
          <span className="font-medium">{roles.length}</span> roles
        </div>

        {filteredRoles.length > 0 && (
          <div className="text-sm text-gray-500">
            {selectedRoles.length > 0 && (
              <span>{selectedRoles.length} selected</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
