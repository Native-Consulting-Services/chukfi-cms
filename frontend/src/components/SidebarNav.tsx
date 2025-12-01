import React, { useState, useEffect } from "react";
import { usePermissions } from "../lib/usePermissions";
import * as LucideIcons from "lucide-react";

interface SidebarNavProps {
  currentPage?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
  collection: string;
  isCollection?: boolean;
}

interface Collection {
  id: string;
  name: string;
  displayName: string;
  status: "active" | "disabled";
  icon?: string;
  color?: string;
}

const getIconComponent = (iconName?: string) => {
  if (!iconName) return LucideIcons.Folder;
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || LucideIcons.Folder;
};

const getColorHex = (colorName?: string): string => {
  const colorMap: Record<string, string> = {
    gray: "#6b7280",
    red: "#ef4444",
    orange: "#f97316",
    amber: "#f59e0b",
    yellow: "#eab308",
    lime: "#84cc16",
    green: "#22c55e",
    emerald: "#10b981",
    teal: "#14b8a6",
    cyan: "#06b6d4",
    sky: "#0ea5e9",
    blue: "#3b82f6",
    indigo: "#6366f1",
    violet: "#8b5cf6",
    purple: "#a855f7",
    fuchsia: "#d946ef",
    pink: "#ec4899",
    rose: "#f43f5e",
  };
  return colorMap[colorName || "indigo"] || "#6366f1";
};

const SidebarNav: React.FC<SidebarNavProps> = ({ currentPage }) => {
  const { canAccess } = usePermissions();
  const [mounted, setMounted] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [navigation, setNavigation] = useState<NavItem[]>([]);

  const loadCollections = () => {
    // Load from localStorage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chukfi_collections");
      if (stored) {
        try {
          const parsedCollections = JSON.parse(stored);
          setCollections(parsedCollections);
          return;
        } catch (e) {
          console.error("Failed to parse stored collections", e);
        }
      }
    }

    // Fallback to empty if no stored data
    setCollections([]);
  };

  useEffect(() => {
    setMounted(true);

    // Load collections immediately
    loadCollections();

    // Also check again after a brief delay to catch late-loading data
    const timer = setTimeout(loadCollections, 100);

    // Set up event listener for storage updates (triggered AFTER localStorage is updated)
    const handleStorageUpdate = () => {
      loadCollections();
    };

    window.addEventListener(
      "collectionsStorageUpdated" as any,
      handleStorageUpdate,
    );

    return () => {
      clearTimeout(timer);
      window.removeEventListener(
        "collectionsStorageUpdated" as any,
        handleStorageUpdate,
      );
    };
  }, []);

  useEffect(() => {
    const baseNavigation: NavItem[] = [
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
    ];

    const activeCollections = collections.filter((c) => c.status === "active");
    const collectionNavItems: NavItem[] = activeCollections.map((col) => ({
      name: col.displayName,
      href: `/admin/${col.name}`,
      collection: col.name,
      isCollection: true,
      icon: ({ className }) => {
        const Icon = getIconComponent(col.icon);
        return (
          <Icon
            className={className}
            style={{ color: getColorHex(col.color) }}
          />
        );
      },
      current: currentPage === col.name,
    }));

    const systemNavigation: NavItem[] = [
      {
        name: "Trash",
        href: "/admin/trash",
        collection: "trash",
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        ),
        current: currentPage === "trash",
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
        name: "Activity",
        href: "/admin/activity",
        collection: "activity",
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        ),
        current: currentPage === "activity",
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

    setNavigation([
      ...baseNavigation,
      ...collectionNavItems,
      ...systemNavigation,
    ]);
  }, [collections, currentPage]);

  const filteredNavigation = navigation.filter((item) => {
    if (item.collection === "dashboard") return true;
    return canAccess(item.collection);
  });

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
                    ? "bg-indigo-100 dark:bg-indigo-900 border-indigo-600 text-indigo-700 dark:text-indigo-300"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                }
                group flex items-center px-3 py-2 text-sm font-medium border-l-4
              `}
            >
              <Icon
                className={`
                  ${item.current ? "text-indigo-500 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"}
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
                  ? "bg-indigo-100 dark:bg-indigo-900 border-indigo-600 text-indigo-700 dark:text-indigo-300"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              }
              group flex items-center px-3 py-2 text-sm font-medium border-l-4
            `}
          >
            <Icon
              className={`
                ${item.current ? "text-indigo-500 dark:text-indigo-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400"}
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
