import { useState } from "react";

interface NewUserForm {
  email: string;
  password: string;
  displayName: string;
}

const API_URL = "http://localhost:8080";

export default function AddUserButton() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState<NewUserForm>({
    email: "",
    password: "",
    displayName: "",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const handleAddUser = async () => {
    setFormError("");
    setFormLoading(true);

    try {
      const token = localStorage.getItem("chukfi_auth_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_URL}/api/v1/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create user");
      }

      // Reset form and close modal
      setNewUser({ email: "", password: "", displayName: "" });
      setShowAddModal(false);

      // Notify to refresh user list
      window.dispatchEvent(new CustomEvent("refreshUsers"));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add user");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
        Add User
      </button>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 opacity-80 transition-opacity"
              onClick={() => setShowAddModal(false)}
            ></div>

            <div className="relative inline-block align-middle bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full sm:p-6 z-50">
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Add New User
                  </h3>
                  <div className="mt-4">
                    {formError && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-800">{formError}</p>
                      </div>
                    )}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddUser();
                      }}
                    >
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={newUser.email}
                            onChange={(e) =>
                              setNewUser({ ...newUser, email: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Password
                          </label>
                          <input
                            type="password"
                            id="password"
                            required
                            minLength={6}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={newUser.password}
                            onChange={(e) =>
                              setNewUser({
                                ...newUser,
                                password: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="displayName"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Display Name
                          </label>
                          <input
                            type="text"
                            id="displayName"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={newUser.displayName}
                            onChange={(e) =>
                              setNewUser({
                                ...newUser,
                                displayName: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          disabled={formLoading}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {formLoading ? "Creating..." : "Create User"}
                        </button>
                        <button
                          type="button"
                          disabled={formLoading}
                          onClick={() => setShowAddModal(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
