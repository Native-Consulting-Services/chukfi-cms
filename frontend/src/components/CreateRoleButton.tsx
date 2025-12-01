import { useState } from "react";

interface NewRoleForm {
  name: string;
  description: string;
}

const API_URL = "http://localhost:8080";

export default function CreateRoleButton() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRole, setNewRole] = useState<NewRoleForm>({
    name: "",
    description: "",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const handleCreateRole = async () => {
    setFormError("");
    setFormLoading(true);

    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_URL}/api/v1/roles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRole),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create role");
      }

      // Reset form and close modal
      setNewRole({ name: "", description: "" });
      setShowCreateModal(false);

      // Notify to refresh roles list
      window.dispatchEvent(new CustomEvent("refreshRoles"));
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create role",
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowCreateModal(true)}
        className="inline-flex items-center rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-400"
      >
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Create Role
      </button>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 dark:bg-gray-900 opacity-80 transition-opacity"
              onClick={() => setShowCreateModal(false)}
            ></div>

            <div className="relative inline-block align-middle bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6 z-50">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Create New Role
                  </h3>
                  <div className="mt-4">
                    {formError && (
                      <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                        <p className="text-sm text-red-800 dark:text-red-300">
                          {formError}
                        </p>
                      </div>
                    )}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleCreateRole();
                      }}
                    >
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="roleName"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Role Name
                          </label>
                          <input
                            type="text"
                            id="roleName"
                            required
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={newRole.name}
                            onChange={(e) =>
                              setNewRole({ ...newRole, name: e.target.value })
                            }
                            placeholder="e.g., Contributor, Moderator"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="roleDescription"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Description
                          </label>
                          <textarea
                            id="roleDescription"
                            required
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={newRole.description}
                            onChange={(e) =>
                              setNewRole({
                                ...newRole,
                                description: e.target.value,
                              })
                            }
                            placeholder="Describe the role's purpose and permissions"
                          />
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          disabled={formLoading}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-base font-medium text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {formLoading ? "Creating..." : "Create Role"}
                        </button>
                        <button
                          type="button"
                          disabled={formLoading}
                          onClick={() => setShowCreateModal(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
