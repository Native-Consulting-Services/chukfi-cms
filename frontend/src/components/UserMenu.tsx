import React, { useState, useEffect } from "react";

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState({
    name: "Admin User",
    email: "admin@example.com",
    avatar: "",
  });

  const loadUserData = () => {
    const storedUser = localStorage.getItem("chukfi_user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser({
          name: userData.name || userData.displayName || "Admin User",
          email: userData.email || "admin@example.com",
          avatar: userData.avatar || "https://avatar.iran.liara.run/public",
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
        className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user.name.charAt(0)}
            </span>
          </div>
        )}
        <span className="hidden md:block ml-3 text-gray-700 text-sm font-medium">
          {user.name}
        </span>
        <svg
          className={`hidden md:block ml-2 h-5 w-5 text-gray-400 transition-transform duration-200 ${
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
          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>

            <a
              href="/admin/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Your Profile
            </a>

            <a
              href="/admin/settings"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Settings
            </a>

            <div className="border-t border-gray-200">
              <button
                type="button"
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
