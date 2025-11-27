import React, { useState, useEffect } from "react";
import { usePermissions } from "../lib/usePermissions";

interface SidebarNavProps {
  currentPage?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
  collection: string; // Permission collection to check
}

const SidebarNav: React.FC<SidebarNavProps> = ({ currentPage }) => {
  const { canAccess } = usePermissions();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation: NavItem[] = [
    {
      name: "Dashboard",
      href: "/admin",
      collection: "dashboard",
      icon: ({ className }) => (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2H3a2 2 0 00-2 2v10z"
          />
        </svg>
      ),
      current: currentPage === "dashboard",
    },
    {
      name: "Collections",
      href: "/admin/collections",
      collection: "collections",
      icon: ({ className }) => (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      current: currentPage === "collections",
    },
    {
      name: "Media",
      href: "/admin/media",
      collection: "media",
      icon: ({ className }) => (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      current: currentPage === "media",
    },
    {
      name: "Users",
      href: "/admin/users",
      collection: "users",
      icon: ({ className }) => (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      current: currentPage === "users",
    },
    {
      name: "Roles",
      href: "/admin/roles",
      collection: "roles",
      icon: ({ className }) => (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      current: currentPage === "roles",
    },
    {
      name: "Profile",
      href: "/admin/profile",
      collection: "profile",
      icon: ({ className }) => (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      current: currentPage === "settings",
    },
  ];

  // Filter navigation items based on permissions - users can only see what they have read access to
  const filteredNavigation = navigation.filter((item) => {
    // Dashboard is always visible to authenticated users
    if (item.collection === "dashboard") return true;
    return canAccess(item.collection);
  });

  // Prevent hydration mismatch by not filtering on server
  if (!mounted) {
    return (
      <div className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              className={`
                ${
                  item.current
                    ? "bg-indigo-100 border-indigo-600 text-indigo-700"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
                group flex items-center px-3 py-2 text-sm font-medium border-l-4
              `}
            >
              <Icon
                className={`
                  ${item.current ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-500"}
                  flex-shrink-0 -ml-1 mr-3 h-6 w-6
                `}
              />
              <span className="truncate">{item.name}</span>
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {filteredNavigation.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.name}
            href={item.href}
            className={`
              ${
                item.current
                  ? "bg-indigo-100 border-indigo-600 text-indigo-700"
                  : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }
              group flex items-center px-3 py-2 text-sm font-medium border-l-4
            `}
          >
            <Icon
              className={`
                ${item.current ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-500"}
                flex-shrink-0 -ml-1 mr-3 h-6 w-6
              `}
            />
            <span className="truncate">{item.name}</span>
          </a>
        );
      })}
    </div>
  );
};

export default SidebarNav;
