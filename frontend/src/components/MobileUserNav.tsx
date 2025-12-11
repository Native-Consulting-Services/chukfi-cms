import React, { useState } from "react";
import { Calendar, ShoppingBag, User, Home, Menu, X } from "lucide-react";

interface MobileUserNavProps {
  currentPage?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

const MobileUserNav: React.FC<MobileUserNavProps> = ({ currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-inset md:hidden dark:text-gray-300 dark:hover:bg-gray-700"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="sr-only">Open main menu</span>
        {isOpen ? (
          <X className="block h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="block h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Mobile menu panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu panel */}
          <div className="fixed inset-x-0 top-16 z-50 border-b border-gray-200 bg-white shadow-lg md:hidden dark:border-gray-700 dark:bg-gray-800">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                      item.current
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileUserNav;
