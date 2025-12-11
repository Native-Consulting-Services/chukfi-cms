import React from "react";
import { Calendar, ShoppingBag, User, Home } from "lucide-react";

interface UserNavProps {
  currentPage?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

const UserNav: React.FC<UserNavProps> = ({ currentPage }) => {
  const navigation: NavItem[] = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: Home,
      current: currentPage === "dashboard" || currentPage === "overview",
    },
    {
      name: "Events",
      href: "/dashboard/events",
      icon: Calendar,
      current: currentPage === "events",
    },
    {
      name: "Orders",
      href: "/dashboard/orders",
      icon: ShoppingBag,
      current: currentPage === "orders",
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User,
      current: currentPage === "profile",
    },
  ];

  return (
    <nav className="hidden md:flex md:space-x-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.name}
            href={item.href}
            className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              item.current
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{item.name}</span>
          </a>
        );
      })}
    </nav>
  );
};

export default UserNav;
