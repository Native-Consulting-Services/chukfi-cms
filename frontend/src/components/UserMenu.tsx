import React, { useState, useEffect } from "react";

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState({
    name: "Admin User",
    email: "admin@example.com",
    avatar: "",
    isAdmin: false,
  });

  const loadUserData = () => {
    const storedUser = localStorage.getItem("chukfi_user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Check if user has admin role
        const isAdmin =
          userData.roles?.some(
            (role: any) =>
              role.name === "Admin" || role.name === "Administrator",
          ) || false;

        setUser({
          name: userData.name || userData.displayName || "User",
          email: userData.email || "user@example.com",
          avatar: userData.avatar || "",
          isAdmin,
        });
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }
  };

  useEffect(() => {
    loadUserData();

    // Listen for profile updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "chukfi_user") {
        loadUserData();
      }
    };

    const handleRefreshUser = () => {
      loadUserData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("refreshUser", handleRefreshUser);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("refreshUser", handleRefreshUser);
    };
  }, []);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem("chukfi_auth_token");
    localStorage.removeItem("chukfi_user");
    // Redirect to home page
    window.location.href = "/";
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="flex max-w-xs items-center rounded-full bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:bg-gray-800 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded="false"
        aria-haspopup="true"
      >
        <span className="sr-only">Open user menu</span>
        {user.avatar ? (
          <img
            className="h-8 w-8 rounded-full object-cover"
            src={user.avatar}
            alt={user.name}
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 dark:bg-indigo-500">
            <span className="text-sm font-medium text-white">
              {user.name.charAt(0)}
            </span>
          </div>
        )}
        <span className="ml-3 hidden text-sm font-medium text-gray-700 md:block dark:text-gray-200">
          {user.name}
        </span>
        <svg
          className={`ml-2 hidden h-5 w-5 text-gray-400 transition-transform duration-200 md:block dark:text-gray-500 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Dropdown */}
          <div className="ring-opacity-5 absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
            <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>

            {user.isAdmin ? (
              <>
                <a
                  href="/admin/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Admin Dashboard
                </a>

                <a
                  href="/admin/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Admin Settings
                </a>
              </>
            ) : (
              <>
                <a
                  href="/dashboard/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Your Profile
                </a>

                <a
                  href="/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Dashboard
                </a>
              </>
            )}

            <div className="border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
